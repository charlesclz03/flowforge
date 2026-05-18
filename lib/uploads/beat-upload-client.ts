import { trackReliabilityEvent } from '@/lib/telemetry/reliability'

export type BeatUploadStrategy = 'signed-put' | 'uppy-tus'

export interface BeatUploadResult {
  publicUrl: string
  storagePath: string
  bucket?: string
  strategy: BeatUploadStrategy
}

export interface BeatUploadInput {
  file: File
  preferResumable?: boolean
  onProgress?: (progress: number) => void
}

interface SignedUploadTicket {
  signedUrl: string
  publicUrl: string
  storagePath: string
  bucket?: string
}

function isResumableUploadEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_SUPABASE_TUS_UPLOADS === 'true'
}

export async function uploadBeatFile({
  file,
  preferResumable = false,
  onProgress,
}: BeatUploadInput): Promise<BeatUploadResult> {
  const ticket = await createSignedUploadTicket(file)

  if (preferResumable && isResumableUploadEnabled()) {
    try {
      await uploadWithUppyTus({ file, ticket, onProgress })
      onProgress?.(100)
      return {
        publicUrl: ticket.publicUrl,
        storagePath: ticket.storagePath,
        bucket: ticket.bucket,
        strategy: 'uppy-tus',
      }
    } catch (error) {
      trackReliabilityEvent(
        'beat_upload_resumable_fallback',
        {
          fileType: file.type,
          fileSize: file.size,
          bucket: ticket.bucket ?? null,
        },
        'warning'
      )
      console.warn('Resumable beat upload failed, falling back to signed PUT', {
        error,
      })
    }
  }

  await uploadWithSignedPut({ file, ticket, onProgress })
  onProgress?.(100)

  return {
    publicUrl: ticket.publicUrl,
    storagePath: ticket.storagePath,
    bucket: ticket.bucket,
    strategy: 'signed-put',
  }
}

async function createSignedUploadTicket(
  file: File
): Promise<SignedUploadTicket> {
  const response = await fetch('/api/upload/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data?.signedUrl || !data?.publicUrl) {
    trackReliabilityEvent(
      'beat_upload_signed_ticket_failed',
      {
        status: response.status,
        fileType: file.type,
        fileSize: file.size,
      },
      'warning'
    )
    throw new Error(data?.error || 'Failed to get upload URL')
  }

  return {
    signedUrl: data.signedUrl,
    publicUrl: data.publicUrl,
    storagePath: data.storagePath,
    bucket: data.bucket,
  }
}

async function uploadWithUppyTus({
  file,
  ticket,
  onProgress,
}: {
  file: File
  ticket: SignedUploadTicket
  onProgress?: (progress: number) => void
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || !ticket.bucket) {
    throw new Error('Supabase resumable upload config is unavailable')
  }

  const [{ Uppy }, { default: Tus }] = await Promise.all([
    import('@uppy/core'),
    import('@uppy/tus'),
  ])

  const uppy = new Uppy({
    autoProceed: false,
    restrictions: {
      maxNumberOfFiles: 1,
    },
  })

  try {
    uppy.use(Tus, {
      endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000],
      removeFingerprintOnSuccess: true,
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${supabaseAnonKey}`,
      },
      allowedMetaFields: [
        'bucketName',
        'objectName',
        'contentType',
        'cacheControl',
      ],
    })

    uppy.addFile({
      name: file.name,
      type: file.type,
      data: file,
      meta: {
        bucketName: ticket.bucket,
        objectName: ticket.storagePath,
        contentType: file.type,
        cacheControl: '3600',
      },
    })

    uppy.on('upload-progress', (_file, progress) => {
      if (!progress.bytesTotal) return
      onProgress?.(
        Math.min(
          99,
          Math.round((progress.bytesUploaded / progress.bytesTotal) * 100)
        )
      )
    })

    const result = await uppy.upload()
    const failed = result?.failed ?? []

    if (failed.length > 0) {
      throw new Error(failed[0]?.error || 'Resumable upload failed')
    }
  } finally {
    uppy.destroy()
  }
}

async function uploadWithSignedPut({
  file,
  ticket,
  onProgress,
}: {
  file: File
  ticket: SignedUploadTicket
  onProgress?: (progress: number) => void
}) {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', ticket.signedUrl)
    xhr.setRequestHeader('Content-Type', file.type)

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      onProgress?.(Math.min(99, Math.round((event.loaded / event.total) * 100)))
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }

      reject(
        (() => {
          trackReliabilityEvent(
            'beat_upload_signed_put_failed',
            {
              status: xhr.status,
              fileType: file.type,
              fileSize: file.size,
            },
            'warning'
          )

          return new Error(
            `Upload failed (${xhr.status}): ${
              xhr.responseText || xhr.statusText || 'Unknown error'
            }. Check if file is < 50MB and storage is not full.`
          )
        })()
      )
    }

    xhr.onerror = () =>
      reject(
        (() => {
          trackReliabilityEvent(
            'beat_upload_signed_put_network_error',
            {
              fileType: file.type,
              fileSize: file.size,
            },
            'warning'
          )
          return new Error('Upload failed due to a network error')
        })()
      )
    xhr.onabort = () =>
      reject(
        (() => {
          trackReliabilityEvent(
            'beat_upload_signed_put_aborted',
            {
              fileType: file.type,
              fileSize: file.size,
            },
            'info'
          )
          return new Error('Upload was cancelled')
        })()
      )
    xhr.send(file)
  })
}

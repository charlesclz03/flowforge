import { beforeEach, describe, expect, it, vi } from 'vitest'
import { uploadBeatFile } from '@/lib/uploads/beat-upload-client'
import { trackReliabilityEvent } from '@/lib/telemetry/reliability'

const uppyMocks = vi.hoisted(() => {
  type UploadProgressHandler = (
    file: unknown,
    progress: { bytesUploaded: number; bytesTotal: number }
  ) => void

  const instances: MockUppy[] = []
  let nextUploadResult: { failed: Array<{ error?: string }> } = { failed: [] }

  class MockUppy {
    handlers: Record<string, UploadProgressHandler> = {}
    use = vi.fn(() => this)
    addFile = vi.fn()
    on = vi.fn((event: string, handler: UploadProgressHandler) => {
      this.handlers[event] = handler
      return this
    })
    upload = vi.fn(async () => {
      this.handlers['upload-progress']?.(null, {
        bytesUploaded: 75,
        bytesTotal: 100,
      })
      return nextUploadResult
    })
    destroy = vi.fn()

    constructor() {
      instances.push(this)
    }
  }

  return {
    MockUppy,
    Tus: vi.fn(),
    instances,
    setNextUploadResult: (result: { failed: Array<{ error?: string }> }) => {
      nextUploadResult = result
    },
  }
})

vi.mock('@uppy/core', () => ({
  Uppy: uppyMocks.MockUppy,
}))

vi.mock('@uppy/tus', () => ({
  default: uppyMocks.Tus,
}))

vi.mock('@/lib/telemetry/reliability', () => ({
  trackReliabilityEvent: vi.fn(),
}))

class MockXMLHttpRequest {
  static instances: MockXMLHttpRequest[] = []
  static nextStatus = 200
  static nextStatusText = 'OK'
  static nextResponseText = ''

  status = MockXMLHttpRequest.nextStatus
  statusText = MockXMLHttpRequest.nextStatusText
  responseText = MockXMLHttpRequest.nextResponseText
  upload = {
    onprogress: null as ((event: ProgressEvent) => void) | null,
  }
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  onabort: (() => void) | null = null
  headers: Record<string, string> = {}
  method = ''
  url = ''

  constructor() {
    MockXMLHttpRequest.instances.push(this)
  }

  open(method: string, url: string) {
    this.method = method
    this.url = url
  }

  setRequestHeader(key: string, value: string) {
    this.headers[key] = value
  }

  send() {
    this.upload.onprogress?.({
      lengthComputable: true,
      loaded: 50,
      total: 100,
    } as ProgressEvent)
    this.onload?.()
  }
}

describe('beat upload client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    MockXMLHttpRequest.instances = []
    MockXMLHttpRequest.nextStatus = 200
    MockXMLHttpRequest.nextStatusText = 'OK'
    MockXMLHttpRequest.nextResponseText = ''
    uppyMocks.instances.length = 0
    uppyMocks.setNextUploadResult({ failed: [] })
    process.env.NEXT_PUBLIC_ENABLE_SUPABASE_TUS_UPLOADS = 'false'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      value: MockXMLHttpRequest,
    })

    global.fetch = vi.fn(async () =>
      Response.json({
        signedUrl: 'https://storage.example/upload',
        publicUrl: 'https://storage.example/public/beat.mp3',
        storagePath: 'users/user-1/beat.mp3',
        bucket: 'recordings',
      })
    ) as typeof fetch
  })

  it('uploads through the signed PUT fallback and reports progress', async () => {
    const progress: number[] = []

    const result = await uploadBeatFile({
      file: new File(['beat'], 'beat.mp3', { type: 'audio/mpeg' }),
      preferResumable: true,
      onProgress: (value) => progress.push(value),
    })

    expect(result).toEqual({
      publicUrl: 'https://storage.example/public/beat.mp3',
      storagePath: 'users/user-1/beat.mp3',
      bucket: 'recordings',
      strategy: 'signed-put',
    })
    expect(MockXMLHttpRequest.instances[0].method).toBe('PUT')
    expect(MockXMLHttpRequest.instances[0].headers['Content-Type']).toBe(
      'audio/mpeg'
    )
    expect(progress).toContain(50)
    expect(progress.at(-1)).toBe(100)
  })

  it('uses Uppy/Tus when enabled and resumable upload succeeds', async () => {
    process.env.NEXT_PUBLIC_ENABLE_SUPABASE_TUS_UPLOADS = 'true'
    const progress: number[] = []

    const result = await uploadBeatFile({
      file: new File(['beat'], 'beat.mp3', { type: 'audio/mpeg' }),
      preferResumable: true,
      onProgress: (value) => progress.push(value),
    })

    expect(result.strategy).toBe('uppy-tus')
    expect(uppyMocks.instances).toHaveLength(1)
    expect(uppyMocks.instances[0].use).toHaveBeenCalled()
    expect(MockXMLHttpRequest.instances).toHaveLength(0)
    expect(progress).toContain(75)
    expect(progress.at(-1)).toBe(100)
  })

  it('falls back to signed PUT when Uppy/Tus fails', async () => {
    process.env.NEXT_PUBLIC_ENABLE_SUPABASE_TUS_UPLOADS = 'true'
    uppyMocks.setNextUploadResult({ failed: [{ error: 'Tus unavailable' }] })

    const result = await uploadBeatFile({
      file: new File(['beat'], 'beat.mp3', { type: 'audio/mpeg' }),
      preferResumable: true,
    })

    expect(result.strategy).toBe('signed-put')
    expect(MockXMLHttpRequest.instances[0].method).toBe('PUT')
    expect(trackReliabilityEvent).toHaveBeenCalledWith(
      'beat_upload_resumable_fallback',
      expect.objectContaining({
        fileType: 'audio/mpeg',
        fileSize: 4,
        bucket: 'recordings',
      }),
      'warning'
    )
  })

  it('surfaces signed URL ticket errors before upload starts', async () => {
    global.fetch = vi.fn(async () =>
      Response.json({ error: 'Storage unavailable' }, { status: 500 })
    ) as typeof fetch

    await expect(
      uploadBeatFile({
        file: new File(['beat'], 'beat.mp3', { type: 'audio/mpeg' }),
      })
    ).rejects.toThrow('Storage unavailable')
    expect(MockXMLHttpRequest.instances).toHaveLength(0)
    expect(trackReliabilityEvent).toHaveBeenCalledWith(
      'beat_upload_signed_ticket_failed',
      expect.objectContaining({
        status: 500,
        fileType: 'audio/mpeg',
        fileSize: 4,
      }),
      'warning'
    )
  })

  it('surfaces signed PUT failures with the storage response text', async () => {
    MockXMLHttpRequest.nextStatus = 403
    MockXMLHttpRequest.nextStatusText = 'Forbidden'
    MockXMLHttpRequest.nextResponseText = 'quota exceeded'

    await expect(
      uploadBeatFile({
        file: new File(['beat'], 'beat.mp3', { type: 'audio/mpeg' }),
      })
    ).rejects.toThrow(
      'Upload failed (403): quota exceeded. Check if file is < 50MB and storage is not full.'
    )
    expect(trackReliabilityEvent).toHaveBeenCalledWith(
      'beat_upload_signed_put_failed',
      expect.objectContaining({
        status: 403,
        fileType: 'audio/mpeg',
        fileSize: 4,
      }),
      'warning'
    )
  })
})

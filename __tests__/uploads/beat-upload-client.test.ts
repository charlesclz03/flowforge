import { beforeEach, describe, expect, it, vi } from 'vitest'
import { uploadBeatFile } from '@/lib/uploads/beat-upload-client'

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
  })
})

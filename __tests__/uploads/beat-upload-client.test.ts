import { beforeEach, describe, expect, it, vi } from 'vitest'
import { uploadBeatFile } from '@/lib/uploads/beat-upload-client'

class MockXMLHttpRequest {
  static instances: MockXMLHttpRequest[] = []

  status = 200
  statusText = 'OK'
  responseText = ''
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
})

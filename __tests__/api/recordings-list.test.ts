import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/server', () => ({
  getServerSessionWithUserId: vi.fn(),
}))

vi.mock('@/lib/db/sessions', () => ({
  getSessions: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  RECORDINGS_BUCKET: 'recordings',
  createServerClient: vi.fn(),
}))

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/recordings/route'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { getSessions } from '@/lib/db/sessions'
import { createServerClient } from '@/lib/supabase/server'

describe('GET /api/recordings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('filters out metadata-only sessions by default', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)

    vi.mocked(getSessions).mockResolvedValue({
      success: true,
      data: [
        {
          id: 'with-audio',
          title: 'With Audio',
          storageUrl: 'user-1/with-audio.webm',
          beatId: 'beat-1',
          beat: { id: 'beat-1', title: 'Beat A', bpm: 90 },
        },
        {
          id: 'metadata-only',
          title: 'Metadata Only',
          storageUrl: null,
          beatId: 'beat-1',
          beat: { id: 'beat-1', title: 'Beat A', bpm: 90 },
        },
      ],
    } as never)

    const createSignedUrls = vi.fn().mockResolvedValue({
      data: [
        {
          path: 'user-1/with-audio.webm',
          signedUrl: 'https://signed/audio.webm',
        },
      ],
      error: null,
    })

    vi.mocked(createServerClient).mockReturnValue({
      storage: {
        from: vi.fn().mockReturnValue({
          createSignedUrls,
        }),
      },
    } as never)

    const req = new NextRequest('http://localhost/api/recordings')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.count).toBe(1)
    expect(data.recordings).toHaveLength(1)
    expect(data.recordings[0].id).toBe('with-audio')
    expect(data.recordings[0].storageUrl).toBe('https://signed/audio.webm')
    expect(data.recordings[0].audioStatus).toBe('ready')
  })

  it('returns metadata-only sessions when includeMetadata=true', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)

    vi.mocked(getSessions).mockResolvedValue({
      success: true,
      data: [
        {
          id: 'with-audio',
          title: 'With Audio',
          storageUrl: 'user-1/with-audio.webm',
          beatId: 'beat-1',
          beat: { id: 'beat-1', title: 'Beat A', bpm: 90 },
        },
        {
          id: 'metadata-only',
          title: 'Metadata Only',
          storageUrl: null,
          beatId: 'beat-1',
          beat: { id: 'beat-1', title: 'Beat A', bpm: 90 },
        },
      ],
    } as never)

    const createSignedUrls = vi.fn().mockResolvedValue({
      data: [
        {
          path: 'user-1/with-audio.webm',
          signedUrl: 'https://signed/audio.webm',
        },
      ],
      error: null,
    })

    vi.mocked(createServerClient).mockReturnValue({
      storage: {
        from: vi.fn().mockReturnValue({
          createSignedUrls,
        }),
      },
    } as never)

    const req = new NextRequest(
      'http://localhost/api/recordings?includeMetadata=true'
    )
    const res = await GET(req)

    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.count).toBe(2)
    expect(data.recordings).toHaveLength(2)
    const metadataOnly = data.recordings.find(
      (r: { id: string }) => r.id === 'metadata-only'
    )
    expect(metadataOnly).toBeTruthy()
    expect(metadataOnly.audioStatus).toBe('stats-only')
  })

  it('marks path-backed sessions without signed URLs as processing', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)

    vi.mocked(getSessions).mockResolvedValue({
      success: true,
      data: [
        {
          id: 'pending-audio',
          title: 'Pending Audio',
          storageUrl: 'user-1/pending-audio.webm',
          beatId: 'beat-1',
          beat: { id: 'beat-1', title: 'Beat A', bpm: 90 },
        },
      ],
    } as never)

    const createSignedUrls = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    })

    vi.mocked(createServerClient).mockReturnValue({
      storage: {
        from: vi.fn().mockReturnValue({
          createSignedUrls,
        }),
      },
    } as never)

    const req = new NextRequest(
      'http://localhost/api/recordings?includeMetadata=true'
    )
    const res = await GET(req)

    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.recordings).toHaveLength(1)
    expect(data.recordings[0].id).toBe('pending-audio')
    expect(data.recordings[0].storageUrl).toBeNull()
    expect(data.recordings[0].audioStatus).toBe('processing')
  })
})

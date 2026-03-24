import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/server', () => ({
  getServerSessionWithUserId: vi.fn(),
}))

vi.mock('@/lib/sessions/save-session-with-progress', () => ({
  saveSessionWithProgress: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  RECORDINGS_BUCKET: 'recordings',
  createServerClient: vi.fn(),
}))

vi.mock('@/lib/subscription/isPro', () => ({
  isProUser: vi.fn(() => true),
}))

vi.mock('@/lib/telemetry/reliability', () => ({
  trackReliabilityEvent: vi.fn(),
  trackReliabilityException: vi.fn(),
}))

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/recordings/route'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { saveSessionWithProgress } from '@/lib/sessions/save-session-with-progress'
import { createServerClient } from '@/lib/supabase/server'

describe('POST /api/recordings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('accepts signed-upload JSON submissions and builds a shared save contract', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue({
      user: {
        id: 'user-1',
        role: 'SUPERADMIN',
        subscriptionStatus: 'active',
      },
    } as never)

    vi.mocked(saveSessionWithProgress).mockResolvedValue({
      success: true,
      data: {
        session: {
          id: 'session-1',
          userId: 'user-1',
          beatId: 'beat-1',
          title: 'Night Shift',
          storageUrl: 'users/user-1/recording.webm',
          fileSizeBytes: 1234,
          durationSeconds: 12,
          frequency: 4,
          difficulty: 2,
          wordCount: 2,
          score: 144,
          vibe: null,
          mode: 'solo',
          restarts: 1,
          playbacks: 2,
          beatOffsetMs: 42,
          fxConfig: { reverb: true },
          createdAt: new Date(),
          isPublic: true,
        },
        newBadges: [],
        xp: {
          gained: 24,
          newLevel: 1,
          currentXP: 24,
          maxXP: 1000,
          breakdown: {
            base: 10,
            duration: 12,
            words: 2,
            achievements: 0,
          },
        },
        meta: {
          totalSessions: 4,
          currentStreak: 2,
          hasRated: false,
        },
      },
    } as never)

    const createSignedUrl = vi.fn().mockResolvedValue({
      data: { signedUrl: 'https://signed.example/recording.webm' },
      error: null,
    })

    vi.mocked(createServerClient).mockReturnValue({
      storage: {
        from: vi.fn().mockReturnValue({
          createSignedUrl,
        }),
      },
    } as never)

    const req = new NextRequest('http://localhost/api/recordings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        beatId: 'beat-1',
        title: 'Night Shift',
        durationSeconds: 12,
        frequency: 4,
        difficulty: 2,
        restarts: 1,
        playbacks: 2,
        beatOffsetMs: 42,
        fileSizeBytes: 1234,
        storagePath: 'users/user-1/recording.webm',
        fxConfig: { reverb: true },
        wordsUsed: ['Alpha', 'Beta'],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    expect(saveSessionWithProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        wordsUsed: ['Alpha', 'Beta'],
        createInput: expect.objectContaining({
          beatId: 'beat-1',
          title: 'Night Shift',
          storageUrl: 'users/user-1/recording.webm',
          fileSizeBytes: 1234,
          durationSeconds: 12,
          frequency: 4,
          difficulty: 2,
          restarts: 1,
          playbacks: 2,
          beatOffsetMs: 42,
          wordCount: 2,
          score: 144,
        }),
      })
    )

    const body = await res.json()
    expect(body.storageUrl).toBe('https://signed.example/recording.webm')
    expect(body.session.storageUrl).toBe(
      'https://signed.example/recording.webm'
    )
  })

  it('rejects signed-upload payloads with a storage path outside the current user scope', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue({
      user: {
        id: 'user-1',
        role: 'SUPERADMIN',
        subscriptionStatus: 'active',
      },
    } as never)

    const req = new NextRequest('http://localhost/api/recordings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        beatId: 'beat-1',
        title: 'Night Shift',
        durationSeconds: 12,
        frequency: 4,
        difficulty: 2,
        fileSizeBytes: 1234,
        storagePath: 'users/other-user/recording.webm',
        wordsUsed: ['Alpha', 'Beta'],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(saveSessionWithProgress).not.toHaveBeenCalled()

    const body = await res.json()
    expect(body.error).toBe('Invalid storagePath for current user')
  })
})

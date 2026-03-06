import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/server', () => ({
  getServerSessionWithUserId: vi.fn(),
}))

vi.mock('@/lib/sessions/save-session-with-progress', () => ({
  saveSessionWithProgress: vi.fn(),
}))

import { getServerSessionWithUserId } from '@/lib/auth/server'
import { saveSessionWithProgress } from '@/lib/sessions/save-session-with-progress'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/session/complete/route'

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
  },
}

describe('POST /api/session/complete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthenticated requests', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/session/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        beatId: 'beat-1',
        durationSeconds: 10,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('accepts numeric fields provided as strings', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue(
      mockSession as never
    )
    vi.mocked(saveSessionWithProgress).mockResolvedValue({
      success: true,
      data: {
        session: {
          id: 'sess-1',
          userId: 'user-123',
          beatId: 'beat-1',
          title: 'NightRidaz',
          storageUrl: null,
          fileSizeBytes: 0,
          durationSeconds: 14,
          frequency: 4,
          difficulty: 2,
          wordCount: 0,
          score: 140,
          vibe: null,
          mode: 'solo',
          restarts: 0,
          playbacks: 0,
          beatOffsetMs: 0,
          fxConfig: null,
          createdAt: new Date(),
          isPublic: true,
        },
        newBadges: [],
        xp: {
          gained: 20,
          newLevel: 1,
          currentXP: 20,
          maxXP: 1000,
          breakdown: { base: 10, duration: 10, words: 0, achievements: 0 },
        },
        meta: {
          totalSessions: 3,
          currentStreak: 0,
          hasRated: false,
        },
      },
    } as never)

    const req = new NextRequest('http://localhost/api/session/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        beatId: 'beat-1',
        title: 'NightRidaz',
        durationSeconds: '14',
        frequency: '4',
        difficulty: '2',
        restarts: '0',
        mode: 'solo',
        wordsUsed: [],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    expect(saveSessionWithProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        createInput: expect.objectContaining({
          beatId: 'beat-1',
          durationSeconds: 14,
          frequency: 4,
          difficulty: 2,
          restarts: 0,
          wordCount: 0,
          score: 140,
        }),
      })
    )
  })

  it('sanitizes DB error details (no prisma internals leaked)', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue(
      mockSession as never
    )
    vi.mocked(saveSessionWithProgress).mockResolvedValue({
      success: false,
      error:
        'Invalid `prisma.freestyleSession.create()` invocation: Argument `durationSeconds`: Invalid value provided. Expected Int, provided String.',
    } as never)

    const req = new NextRequest('http://localhost/api/session/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        beatId: 'beat-1',
        durationSeconds: 14,
        wordsUsed: [],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(500)

    const data = await res.json()
    expect(data.error).toBe('Failed to save session')
    expect(String(data.error).toLowerCase()).not.toContain('prisma')
  })

  it('returns 400 for invalid durationSeconds', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue(
      mockSession as never
    )

    const req = new NextRequest('http://localhost/api/session/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        beatId: 'beat-1',
        durationSeconds: 'not-a-number',
        wordsUsed: [],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(saveSessionWithProgress).not.toHaveBeenCalled()
  })
})

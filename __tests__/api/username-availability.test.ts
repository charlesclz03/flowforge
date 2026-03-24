import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/server', () => ({
  getServerSessionWithUserId: vi.fn(),
}))

vi.mock('@/lib/auth/username', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/username')>(
    '@/lib/auth/username'
  )

  return {
    ...actual,
    isUsernameAvailable: vi.fn(),
  }
})

import { getServerSessionWithUserId } from '@/lib/auth/server'
import { isUsernameAvailable } from '@/lib/auth/username'
import { GET } from '@/app/api/user/profile/username-availability/route'

describe('GET /api/user/profile/username-availability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthenticated requests', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue(null)

    const res = await GET(
      new Request(
        'http://localhost/api/user/profile/username-availability?username=artist'
      )
    )

    expect(res.status).toBe(401)
  })

  it('returns availability and normalized username payload', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(isUsernameAvailable).mockResolvedValue(true)

    const res = await GET(
      new Request(
        'http://localhost/api/user/profile/username-availability?username=Fresh%20Handle'
      )
    )

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      available: true,
      normalized: 'freshhandle',
      error: null,
    })
  })
})

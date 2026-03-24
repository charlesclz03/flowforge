import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/server', () => ({
  getServerSessionWithUserId: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        remove: vi.fn(),
      })),
    },
  })),
}))

vi.mock('@/lib/security/avatar', () => ({
  AVATAR_MAX_BYTES: 5_000_000,
  avatarExtensionForMimeType: vi.fn(() => 'png'),
  detectAvatarMimeType: vi.fn(() => 'image/png'),
  isAllowedAvatarMimeType: vi.fn(() => true),
  isValidAvatarFileName: vi.fn(() => true),
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
import { prisma } from '@/lib/prisma'
import { isUsernameAvailable } from '@/lib/auth/username'
import { PATCH } from '@/app/api/user/profile/route'

describe('PATCH /api/user/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthenticated requests', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue(null)

    const res = await PATCH(
      new Request('http://localhost/api/user/profile', {
        method: 'PATCH',
        body: new FormData(),
      })
    )

    expect(res.status).toBe(401)
  })

  it('blocks username changes after profile setup is complete', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      image: null,
      username: 'artist',
      profileSetupCompletedAt: new Date('2026-03-20T10:00:00.000Z'),
    } as never)

    const formData = new FormData()
    formData.append('username', 'new-name')

    const res = await PATCH(
      new Request('http://localhost/api/user/profile', {
        method: 'PATCH',
        body: formData,
      })
    )

    expect(res.status).toBe(403)
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  it('marks setup complete on the required profile flow', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      image: null,
      username: 'artist',
      profileSetupCompletedAt: null,
    } as never)
    vi.mocked(isUsernameAvailable).mockResolvedValue(true)
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user-1',
      username: 'freshhandle',
      profileSetupCompletedAt: new Date('2026-03-24T10:00:00.000Z'),
    } as never)

    const formData = new FormData()
    formData.append('username', 'Fresh Handle')
    formData.append('bio', 'Ready for the booth')
    formData.append('completeProfile', 'true')

    const res = await PATCH(
      new Request('http://localhost/api/user/profile', {
        method: 'PATCH',
        body: formData,
      })
    )

    expect(res.status).toBe(200)
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          username: 'freshhandle',
          bio: 'Ready for the booth',
          profileSetupCompletedAt: expect.any(Date),
        }),
      })
    )
  })

  it('returns 409 when the requested username is already taken', async () => {
    vi.mocked(getServerSessionWithUserId).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      image: null,
      username: 'artist',
      profileSetupCompletedAt: null,
    } as never)
    vi.mocked(isUsernameAvailable).mockResolvedValue(false)

    const formData = new FormData()
    formData.append('username', 'taken-name')

    const res = await PATCH(
      new Request('http://localhost/api/user/profile', {
        method: 'PATCH',
        body: formData,
      })
    )

    expect(res.status).toBe(409)
    expect(prisma.user.update).not.toHaveBeenCalled()
  })
})

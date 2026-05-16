import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import {
  redirectIncompleteProfileSetupIfNeeded,
  requireCompletedUserSession,
  requireUserSession,
} from '@/lib/auth/require-user-session'

describe('require user session helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects anonymous users to sign-in with the requested callback', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    await requireUserSession('/practice')

    expect(redirect).toHaveBeenCalledWith('/login?callbackUrl=%2Fpractice')
  })

  it('redirects incomplete users to required profile setup', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', profileSetupCompletedAt: null },
    } as never)

    await requireCompletedUserSession('/settings')

    expect(redirect).toHaveBeenCalledWith('/complete-profile?next=%2Fsettings')
  })

  it('allows completed users through guarded routes', async () => {
    const session = {
      user: {
        id: 'user-1',
        username: 'artist',
        profileSetupCompletedAt: '2026-03-24T10:00:00.000Z',
      },
    }
    vi.mocked(getServerSession).mockResolvedValue(session as never)

    const resolved = await requireCompletedUserSession('/profile')

    expect(redirect).not.toHaveBeenCalled()
    expect(resolved).toEqual(session)
  })

  it('redirects incomplete deep links without requiring a sign-in bounce', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-2', profileSetupCompletedAt: null },
    } as never)

    await redirectIncompleteProfileSetupIfNeeded('/recordings')

    expect(redirect).toHaveBeenCalledWith(
      '/complete-profile?next=%2Frecordings'
    )
  })
})

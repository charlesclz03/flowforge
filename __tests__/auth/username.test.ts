import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'
import {
  getUsernameConstraints,
  isUsernameAvailable,
  resolveUniqueUsername,
  sanitizeUsernameCandidate,
  validateUsernameCandidate,
} from '@/lib/auth/username'

describe('username helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sanitizes usernames into a lowercase handle-safe format', () => {
    expect(sanitizeUsernameCandidate('  My Artist Name!  ')).toBe('myartistname')
  })

  it('validates reserved names and length requirements', () => {
    expect(validateUsernameCandidate('ab').error).toContain('at least')
    expect(validateUsernameCandidate('practice').error).toContain('reserved')
    expect(validateUsernameCandidate('valid_handle').error).toBeNull()
  })

  it('checks username availability against prisma', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({ id: 'taken' } as never)
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null as never)

    await expect(isUsernameAvailable('taken_name')).resolves.toBe(false)
    await expect(isUsernameAvailable('fresh_name')).resolves.toBe(true)
  })

  it('adds a numeric suffix until a unique username is found', async () => {
    vi.mocked(prisma.user.findFirst)
      .mockResolvedValueOnce({ id: 'taken-1' } as never)
      .mockResolvedValueOnce({ id: 'taken-2' } as never)
      .mockResolvedValueOnce(null as never)

    await expect(resolveUniqueUsername('Artist')).resolves.toBe('artist2')
  })

  it('exposes the public username constraints', () => {
    expect(getUsernameConstraints()).toEqual({
      minLength: 3,
      maxLength: 24,
    })
  })
})

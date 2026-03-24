import { prisma } from '@/lib/prisma'

const USERNAME_MIN_LENGTH = 3
const USERNAME_MAX_LENGTH = 24

const RESERVED_USERNAMES = new Set([
  'admin',
  'api',
  'achievements',
  'auth',
  'calibration',
  'complete-profile',
  'debug',
  'difficultyselection',
  'download',
  'feedback',
  'howitworks',
  'legal',
  'offline',
  'orderconfirmed',
  'patch-notes',
  'practice',
  'profile',
  'recordings',
  'review',
  'search',
  'selectdifficulty',
  'session',
  'settings',
  'tracks',
  'u',
])

export interface UsernameValidationResult {
  normalized: string
  error: string | null
}

export function sanitizeUsernameCandidate(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_-]/g, '')
}

export function validateUsernameCandidate(
  value: string
): UsernameValidationResult {
  const normalized = sanitizeUsernameCandidate(value)

  if (!normalized) {
    return {
      normalized,
      error: 'Choose a username to continue.',
    }
  }

  if (normalized.length < USERNAME_MIN_LENGTH) {
    return {
      normalized,
      error: `Username must be at least ${USERNAME_MIN_LENGTH} characters.`,
    }
  }

  if (normalized.length > USERNAME_MAX_LENGTH) {
    return {
      normalized,
      error: `Username must be ${USERNAME_MAX_LENGTH} characters or less.`,
    }
  }

  if (!/^[a-z0-9_-]+$/.test(normalized)) {
    return {
      normalized,
      error: 'Use only lowercase letters, numbers, hyphens, or underscores.',
    }
  }

  if (RESERVED_USERNAMES.has(normalized)) {
    return {
      normalized,
      error: 'That username is reserved. Please choose another one.',
    }
  }

  return {
    normalized,
    error: null,
  }
}

export async function isUsernameAvailable(
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  const { normalized, error } = validateUsernameCandidate(username)
  if (error) return false

  const existing = await prisma.user.findFirst({
    where: {
      username: normalized,
      ...(excludeUserId
        ? {
            NOT: {
              id: excludeUserId,
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
  })

  return !existing
}

export async function resolveUniqueUsername(
  candidate: string,
  excludeUserId?: string
): Promise<string> {
  const sanitized = sanitizeUsernameCandidate(candidate) || 'artist'
  const base = sanitized.slice(0, USERNAME_MAX_LENGTH) || 'artist'

  let suffix = 0
  while (true) {
    const nextCandidate =
      suffix === 0
        ? base
        : `${base.slice(0, USERNAME_MAX_LENGTH - String(suffix).length)}${suffix}`

    if (await isUsernameAvailable(nextCandidate, excludeUserId)) {
      return nextCandidate
    }

    suffix += 1
  }
}

export function getUsernameConstraints() {
  return {
    minLength: USERNAME_MIN_LENGTH,
    maxLength: USERNAME_MAX_LENGTH,
  }
}

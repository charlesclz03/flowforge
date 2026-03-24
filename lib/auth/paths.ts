interface InternalPathUser {
  id?: string | null
  username?: string | null
  profileSetupCompletedAt?: string | Date | null
}

function decodePathValue(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export function normalizeInternalPath(raw?: string | null): string | null {
  if (!raw) return null

  const decoded = decodePathValue(raw)
  if (!decoded.startsWith('/') || decoded.startsWith('//')) {
    return null
  }

  return decoded
}

export function buildAuthContinuePath(next?: string | null): string {
  const normalized = normalizeInternalPath(next) || '/practice'
  return `/auth/continue?next=${encodeURIComponent(normalized)}`
}

export function buildCompleteProfilePath(next?: string | null): string {
  const normalized = normalizeInternalPath(next) || '/practice'
  return `/complete-profile?next=${encodeURIComponent(normalized)}`
}

export function isProfileSetupComplete(
  user?: InternalPathUser | null
): boolean {
  return Boolean(user?.profileSetupCompletedAt)
}

export function getDefaultAuthenticatedPath(
  user?: InternalPathUser | null
): string {
  if (user?.username) {
    return `/u/${encodeURIComponent(user.username)}`
  }

  return '/practice'
}

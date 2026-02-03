import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function getSuperadminEmailAllowlist(): Set<string> {
  const allowlist = new Set<string>()

  const rawList = process.env.SUPERADMIN_EMAILS
  if (rawList) {
    rawList
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
      .forEach((e) => allowlist.add(e))
  }

  // Back-compat (deprecated): single admin email
  const legacyAdmin = process.env.ADMIN_EMAIL
  if (legacyAdmin) allowlist.add(legacyAdmin.trim().toLowerCase())

  return allowlist
}

/**
 * Checks if the current session user is a Super Admin.
 * Returns boolean. Does not throw.
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    await verifySuperAdmin()
    return true
  } catch {
    return false
  }
}

/**
 * Enforces Super Admin access.
 * Throws an error if not authorized.
 * returns the session if authorized.
 */
export async function verifySuperAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  if (session.user.role === 'SUPERADMIN') {
    return session
  }

  // Transitional: email allowlist (server-side only)
  const allowlist = getSuperadminEmailAllowlist()
  if (allowlist.has(session.user.email.toLowerCase())) {
    return session
  }

  throw new Error('Forbidden')
}

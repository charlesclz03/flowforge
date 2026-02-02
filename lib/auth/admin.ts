import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ADMIN_EMAILS = ['triplyricist@gmail.com', 'charles.cluzeaud@gmail.com']

/**
 * Checks if the current session user is a Super Admin.
 * Returns boolean. Does not throw.
 */
export async function isSuperAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  const envAdmin = process.env.ADMIN_EMAIL

  if (!session?.user?.email) return false

  // Check Role
  if (session.user.role === 'SUPERADMIN') return true

  // Check Email Whitelist
  if (ADMIN_EMAILS.includes(session.user.email)) return true
  if (envAdmin && session.user.email === envAdmin) return true

  return false
}

/**
 * Enforces Super Admin access.
 * Throws an error if not authorized.
 * returns the session if authorized.
 */
export async function verifySuperAdmin() {
  const session = await getServerSession(authOptions)
  const allowed = await isSuperAdmin()

  if (!allowed) {
    throw new Error('Unauthorized: Super Admin access required')
  }

  return session
}

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import {
  buildCompleteProfilePath,
  isProfileSetupComplete,
  normalizeInternalPath,
} from '@/lib/auth/paths'

export function buildSignInRedirect(callbackPath: string): string {
  const normalized = normalizeInternalPath(callbackPath) || '/'
  return `/?callbackUrl=${encodeURIComponent(normalized)}`
}

export async function requireUserSession(callbackPath: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(buildSignInRedirect(callbackPath))
  }

  return session
}

export async function requireCompletedUserSession(callbackPath: string) {
  const session = await requireUserSession(callbackPath)

  if (!isProfileSetupComplete(session.user)) {
    redirect(buildCompleteProfilePath(callbackPath))
  }

  return session
}

export async function redirectIncompleteProfileSetupIfNeeded(
  callbackPath: string
) {
  const session = await getServerSession(authOptions)

  if (session?.user && !isProfileSetupComplete(session.user)) {
    redirect(buildCompleteProfilePath(callbackPath))
  }

  return session
}

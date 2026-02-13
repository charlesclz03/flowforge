import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

function normalizeCallbackPath(callbackPath: string): string {
  if (!callbackPath) return '/'
  if (callbackPath.startsWith('/')) return callbackPath
  return `/${callbackPath}`
}

export function buildSignInRedirect(callbackPath: string): string {
  const normalized = normalizeCallbackPath(callbackPath)
  return `/?callbackUrl=${encodeURIComponent(normalized)}`
}

export async function requireUserSession(callbackPath: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(buildSignInRedirect(callbackPath))
  }

  return session
}

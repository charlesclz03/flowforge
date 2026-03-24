import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { buildSignInRedirect } from '@/lib/auth/require-user-session'
import {
  buildCompleteProfilePath,
  getDefaultAuthenticatedPath,
  isProfileSetupComplete,
  normalizeInternalPath,
} from '@/lib/auth/paths'

type AuthContinueSearchParams = {
  next?: string | string[]
}

export default async function AuthContinuePage({
  searchParams,
}: {
  searchParams?: Promise<AuthContinueSearchParams>
}) {
  const params = (await searchParams) ?? {}
  const nextValue = Array.isArray(params.next) ? params.next[0] : params.next
  const nextPath = normalizeInternalPath(nextValue) || '/practice'
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(buildSignInRedirect(nextPath))
  }

  if (!isProfileSetupComplete(session.user)) {
    redirect(buildCompleteProfilePath(nextPath))
  }

  redirect(nextPath || getDefaultAuthenticatedPath(session.user))
}

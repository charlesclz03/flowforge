import { redirect } from 'next/navigation'
import { requireUserSession } from '@/lib/auth/require-user-session'
import {
  getDefaultAuthenticatedPath,
  isProfileSetupComplete,
  normalizeInternalPath,
} from '@/lib/auth/paths'
import CompleteProfileClient from './CompleteProfileClient'

type CompleteProfileSearchParams = {
  next?: string | string[]
}

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams?: Promise<CompleteProfileSearchParams>
}) {
  const params = (await searchParams) ?? {}
  const nextValue = Array.isArray(params.next) ? params.next[0] : params.next
  const session = await requireUserSession('/complete-profile')
  const nextPath =
    normalizeInternalPath(nextValue) ||
    getDefaultAuthenticatedPath(session.user)

  if (isProfileSetupComplete(session.user)) {
    redirect(nextPath)
  }

  return (
    <CompleteProfileClient
      nextPath={nextPath}
      user={{
        name: session.user.name || null,
        username: session.user.username || '',
        bio: session.user.bio || '',
        image: session.user.image || null,
      }}
    />
  )
}

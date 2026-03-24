import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import {
  buildCompleteProfilePath,
  isProfileSetupComplete,
  normalizeInternalPath,
} from '@/lib/auth/paths'

type HomeSearchParams = {
  callbackUrl?: string | string[]
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<HomeSearchParams>
}) {
  const params = (await searchParams) ?? {}
  const callbackValue = Array.isArray(params.callbackUrl)
    ? params.callbackUrl[0]
    : params.callbackUrl
  const callbackPath = normalizeInternalPath(callbackValue)
  const session = await getServerSession(authOptions)

  if (callbackPath) {
    if (session?.user) {
      if (!isProfileSetupComplete(session.user)) {
        redirect(buildCompleteProfilePath(callbackPath))
      }
      redirect(callbackPath)
    }

    redirect(`/howitworks?callbackUrl=${encodeURIComponent(callbackPath)}`)
  }

  redirect('/howitworks')
}

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import {
  buildCompleteProfilePath,
  isProfileSetupComplete,
  normalizeInternalPath,
} from '@/lib/auth/paths'
import { PLANS } from '@/lib/stripe'
import { LandingExperience } from '@/components/organisms/landing/LandingExperience'

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

  // Authenticated visitors continue straight into the app (unchanged behavior).
  if (session?.user) {
    redirect('/howitworks')
  }

  // Logged-out visitors and crawlers get a real, server-rendered landing page
  // instead of an immediate redirect (the root previously served "Loading…").
  return (
    <LandingExperience
      monthlyPrice={PLANS.monthly.price}
      yearlyPrice={PLANS.yearly.price}
    />
  )
}

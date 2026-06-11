import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { HowItWorksContent } from '@/components/organisms/onboarding/HowItWorksContent'
import { FALLBACK_BEATS } from '@/lib/data/fallbacks'
import { getBeats } from '@/lib/db/beats'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Blueprint',
}

export const revalidate = 3600 // Cache for 1 hour

export default async function HowItWorksPage() {
  const beatCount = await getBeats()
    .then((result) =>
      result.success && result.data && result.data.length > 0
        ? result.data.length
        : FALLBACK_BEATS.length
    )
    .catch(() => FALLBACK_BEATS.length)

  return (
    <OnboardingLayout
      customTitle="THE BLUEPRINT"
      customSubtitle="Mastering the art of freestyle"
      showSettings={false}
      showProgress={false}
    >
      <HowItWorksContent beatCount={beatCount} />
    </OnboardingLayout>
  )
}

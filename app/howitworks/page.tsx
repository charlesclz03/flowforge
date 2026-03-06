import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { HowItWorksContent } from '@/components/organisms/onboarding/HowItWorksContent'

import { prisma } from '@/lib/prisma'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Blueprint',
}

export const revalidate = 3600 // Cache for 1 hour

export default async function HowItWorksPage() {
  // Fetch beat count, defaulting to 10 if error
  const beatCount = await prisma.beat.count().catch(() => 10)

  return (
    <OnboardingLayout
      customTitle="THE BLUEPRINT"
      customSubtitle="Mastering the art of freestyle"
      showSettings={false}
    >
      <HowItWorksContent beatCount={beatCount} />
    </OnboardingLayout>
  )
}

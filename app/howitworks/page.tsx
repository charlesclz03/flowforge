'use client'

import { useRouter } from 'next/navigation'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { HowItWorksContent } from '@/components/organisms/onboarding/HowItWorksContent'

export default function HowItWorksPage() {
  const router = useRouter()

  return (
    <OnboardingLayout
      customTitle="THE BLUEPRINT"
      customSubtitle="Mastering the art of freestyle"
    >
      <HowItWorksContent
        onStartPractice={() => router.push('/difficultyselection')}
      />
    </OnboardingLayout>
  )
}

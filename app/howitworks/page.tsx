'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { HowItWorksContent } from '@/components/organisms/onboarding/HowItWorksContent'
import { usePracticeSession } from '@/contexts/SessionContext'

export default function HowItWorksPage() {
  const router = useRouter()
  const { resetSession } = usePracticeSession()

  // Start with a clean session every time we enter the flow
  useEffect(() => {
    resetSession()
  }, [resetSession])

  return (
    <OnboardingLayout showBackButton onBack={() => router.push('/')}>
      <HowItWorksContent onStartPractice={() => router.push('/difficultyselection')} />
    </OnboardingLayout>
  )
}


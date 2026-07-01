import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { HowItWorksContent } from '@/components/organisms/onboarding/HowItWorksContent'
import { FALLBACK_BEATS } from '@/lib/data/fallbacks'
import { getBeats } from '@/lib/db/beats'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works — Freestyle Rap Practice in 4 Steps',
  description:
    'Learn how to practice freestyle rap with FreeStyla: pick a beat, choose your language (EN/FR/PT), difficulty and cadence, then freestyle in time with beat-synced word prompts — solo or in a cypher. Record, review, and track your progress.',
  alternates: {
    canonical: '/howitworks',
  },
  openGraph: {
    title: 'How FreeStyla works — freestyle rap practice in 4 steps',
    description:
      'Pick a beat, set your language and difficulty, and freestyle in time with beat-synced word prompts. Solo or 4-player cypher. Record and review your bars.',
    url: '/howitworks',
  },
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
      customSubtitle="Freestyle rap practice, mastered step by step"
      showSettings={false}
      showProgress={false}
    >
      <HowItWorksContent beatCount={beatCount} />
    </OnboardingLayout>
  )
}

'use client'

import { LandingTemplate } from '@/components/templates/LandingTemplate'
import { LandingHero } from '@/components/organisms/landing/LandingHero'
import { LandingHowItWorks } from '@/components/organisms/landing/LandingHowItWorks'
import { LandingTestimonials } from '@/components/organisms/landing/LandingTestimonials'
import { LandingPricing } from '@/components/organisms/landing/LandingPricing'
import { LandingFAQ } from '@/components/organisms/landing/LandingFAQ'

// Honest, product-true facts only — no invented metrics or social proof.
const HERO_STATS = [
  {
    label: 'Languages',
    value: 'EN · FR · PT',
    caption: 'Practice in your language',
  },
  { label: 'Beat vault', value: '40+', caption: 'Practice-ready tracks' },
  { label: 'Modes', value: 'Solo + Cypher', caption: 'Up to 4 players' },
]

const HERO_BADGES = [
  { label: 'Mode', value: 'Solo or Cypher', accentClass: 'bg-accent-purple' },
  { label: 'Cadence', value: '2 · 4 · 8 · 16 bars', accentClass: 'bg-accent-blue' },
  { label: 'Start', value: 'No card needed', accentClass: 'bg-accent-green' },
]

const FAQ_ITEMS = [
  {
    question: 'Is Freestyla free?',
    answer:
      'Yes — practice is free forever. Pro (EUR 4.99/month or EUR 49/year) adds saved, replayable, and downloadable takes, the premium beat vault, your own beat uploads, and full stats and streak history.',
  },
  {
    question: 'Do I need to install anything?',
    answer:
      'No. Freestyla runs in your mobile or desktop browser and works offline once loaded. There is also an Android app, and on iPhone you can add it to your home screen.',
  },
  {
    question: 'Which languages are supported?',
    answer:
      'English, French, and Portuguese — for both the interface and the on-beat word prompts.',
  },
  {
    question: 'Can I practice with friends?',
    answer:
      'Yes. Cypher mode is a local pass-the-phone session for 2 to 4 players, with the timer ring tracking whose turn it is.',
  },
  {
    question: 'Can I keep my recordings?',
    answer:
      'You can practice and see your stats for free. Saving, replaying, and downloading your recordings is a Pro feature.',
  },
  {
    question: 'How do I cancel Pro?',
    answer:
      'From the Manage Subscription button in the app, which opens the secure Stripe portal. Your access continues until the end of the paid period.',
  },
]

interface LandingExperienceProps {
  monthlyPrice: number
  yearlyPrice: number
  isAuthenticated?: boolean
  isPro?: boolean
  ctaPath?: string
}

export function LandingExperience({
  monthlyPrice,
  yearlyPrice,
  isAuthenticated = false,
  isPro = false,
  ctaPath = '/difficultyselection',
}: LandingExperienceProps) {
  return (
    <LandingTemplate
      hero={
        <LandingHero
          stats={HERO_STATS}
          badges={HERO_BADGES}
          progress={65}
          isAuthenticated={isAuthenticated}
          ctaPath={ctaPath}
        />
      }
      howItWorks={<LandingHowItWorks />}
      testimonials={<LandingTestimonials />}
      pricing={
        <LandingPricing
          isAuthenticated={isAuthenticated}
          isPro={isPro}
          monthlyPrice={monthlyPrice}
          yearlyPrice={yearlyPrice}
          ctaPath={ctaPath}
        />
      }
      faq={<LandingFAQ items={FAQ_ITEMS} />}
    />
  )
}

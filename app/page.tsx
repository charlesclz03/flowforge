'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { LandingTemplate } from '@/components/templates'
import {
  LandingHero,
  LandingHowItWorks,
  LandingPricing,
  LandingFAQ,
} from '@/components/organisms/landing'

const HERO_STATS = [
  { label: 'Beats Curated', value: '10+', caption: 'Hand-mastered instrumentals' },
  { label: 'Word Vault', value: '∞', caption: 'Adaptive prompt engine' },
  { label: 'Practice Windows', value: '24/7', caption: 'Always-on companion' },
]

const SESSION_BADGES = [
  { label: 'Session Tempo', value: '90 BPM', accentClass: 'bg-accent-blue' },
  { label: 'Difficulty', value: 'Medium', accentClass: 'bg-accent-purple' },
  { label: 'Frequency', value: '8 Bars', accentClass: 'bg-accent-purple' },
]

const FAQ_ITEMS = [
  {
    question: 'What is FlowForge?',
    answer:
      'FlowForge is an AI-powered freestyle rap practice platform that helps you improve your skills with on-beat word prompts, professional beats, and session recording.',
  },
  {
    question: 'How does the word prompt system work?',
    answer:
      "Words appear on-beat, synced to your selected beat's BPM. You can choose how often words appear (every 4, 8, or 16 bars) and the difficulty level (easy, medium, or hard).",
  },
  {
    question: 'Can I download my recordings?',
    answer:
      'Recording download will be available with the Premium plan (coming soon). Free users can review their sessions within the app.',
  },
  {
    question: 'What browsers are supported?',
    answer:
      'FlowForge works best on modern browsers like Chrome, Firefox, Safari, and Edge. Microphone access is required for recording your freestyle sessions.',
  },
]

function HomePageContent() {
  const [progress, setProgress] = useState(0.25)
  const { status, data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isAuthenticated = status === 'authenticated'

  // Redirect to callbackUrl after sign-in
  useEffect(() => {
    if (isAuthenticated && session) {
      const callbackUrl = searchParams?.get('callbackUrl')
      if (callbackUrl) {
        const decodedUrl = decodeURIComponent(callbackUrl)
        console.log('Redirecting to callback URL:', decodedUrl)
        router.push(decodedUrl)
      }
    }
  }, [isAuthenticated, session, searchParams, router])

  // Animate progress ring
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.01
        return next >= 1 ? 0 : next
      })
    }, 120)

    return () => clearInterval(interval)
  }, [])

  return (
    <LandingTemplate
      hero={
        <>
          {/* Hero Header */}
          <header className="text-center md:text-left">
            <h1 className="max-w-3xl text-balance text-display font-light text-white">
              The freestyle command center for artists in motion.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-text-secondary">
              Designed with the midnight precision of the iOS Clock and the luminous polish of
              Revolut—your beats, prompts, and recordings unified in a single glowing cockpit.
            </p>
          </header>

          <LandingHero
            stats={HERO_STATS}
            badges={SESSION_BADGES}
            progress={progress}
            isAuthenticated={isAuthenticated}
          />
        </>
      }
      howItWorks={<LandingHowItWorks />}
      pricing={<LandingPricing />}
      faq={<LandingFAQ items={FAQ_ITEMS} />}
    />
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <p className="text-text-secondary">Loading...</p>
          </div>
        </main>
      }
    >
      <HomePageContent />
    </Suspense>
  )
}

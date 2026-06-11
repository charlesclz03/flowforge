'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Languages,
  Mic,
  Music,
  Sparkles,
  Target,
  Timer,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { IconFrame } from '@/components/atoms/IconFrame'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { trackEvent } from '@/lib/analytics/track'
import { cn } from '@/lib/utils'

interface HowItWorksContentProps {
  onStartPractice?: () => void
  beatCount?: number
}

interface FeatureItem {
  label: string
  icon: LucideIcon
}

interface BlueprintSlide {
  id: string
  step?: number
  title: string
  body: string
  icon: LucideIcon
  tone: 'blue' | 'purple' | 'red' | 'green'
  visual: 'beats' | 'flow' | 'record' | 'features'
  features?: FeatureItem[]
}

const FEATURE_LIST: FeatureItem[] = [
  { label: 'Language-first practice', icon: Languages },
  { label: 'Precision timing', icon: Timer },
  { label: 'Freestyle practice engine with beats', icon: Sparkles },
  { label: 'Beat synchronization', icon: Zap },
  { label: 'Session tracking', icon: BarChart3 },
]

function SlideVisual({
  slide,
  beatCount,
}: {
  slide: BlueprintSlide
  beatCount: number
}) {
  if (slide.visual === 'features') {
    return (
      <div className="space-y-2.5">
        {slide.features?.map((feature) => (
          <div
            key={feature.label}
            className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 text-sm font-semibold text-white"
          >
            <IconFrame
              icon={feature.icon}
              variant="inline"
              tone="green"
              decorative
            />
            <span className="min-w-0 leading-tight">{feature.label}</span>
          </div>
        ))}
      </div>
    )
  }

  if (slide.visual === 'record') {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-accent-purple/35 bg-black/40 shadow-purple-glow">
          <div className="absolute inset-4 rounded-full border-4 border-accent-purple/70" />
          <div className="absolute inset-8 rounded-full border border-white/10 bg-white/[0.04]" />
          <div className="relative text-center">
            <p className="font-mono text-3xl font-black tracking-widest text-white">
              FLOW
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-text-tertiary">
              live take
            </p>
          </div>
          <div className="absolute -bottom-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-red/30 bg-accent-red/15 text-accent-red">
            <Mic size={25} />
          </div>
        </div>
      </div>
    )
  }

  if (slide.visual === 'flow') {
    return (
      <div className="grid gap-3">
        {[
          ['Language', 'EN / FR / PT'],
          ['Cadence', '2 / 4 / 8 / 16 bars'],
          ['Mode', 'Solo or Cypher'],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-black/25 p-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
              {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {['Boom Bap', 'Trap', 'Battle'].map((genre, index) => (
        <div
          key={genre}
          className="flex min-h-[52px] items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4"
        >
          <div>
            <p className="text-sm font-semibold text-white">{genre}</p>
            <p className="text-xs text-text-tertiary">
              {index === 0 ? `${beatCount} public tracks` : 'BPM tagged'}
            </p>
          </div>
          <Music size={20} className="text-accent-blue" />
        </div>
      ))}
    </div>
  )
}

export function HowItWorksContent({
  onStartPractice,
  beatCount = 10,
}: HowItWorksContentProps) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const handleStart =
    onStartPractice || (() => router.push('/difficultyselection'))

  const slides = useMemo<BlueprintSlide[]>(
    () => [
      {
        id: 'secure-sound',
        step: 1,
        title: 'Secure Your Sound',
        body: `Start from the same public Beat Vault used on /tracks, with ${beatCount} tracks ready for practice.`,
        icon: Music,
        tone: 'blue',
        visual: 'beats',
      },
      {
        id: 'architect-flow',
        step: 2,
        title: 'Architect Your Flow',
        body: 'Pick language, difficulty, cadence, and solo or cypher mode before the beat drops.',
        icon: Target,
        tone: 'purple',
        visual: 'flow',
      },
      {
        id: 'immortalize-bars',
        step: 3,
        title: 'Immortalize Your Bars',
        body: 'Freestyle inside the timing ring while prompts hit in sync with the instrumental.',
        icon: Mic,
        tone: 'red',
        visual: 'record',
      },
      {
        id: 'feature-list',
        title: 'Practice Engine',
        body: 'Everything stays focused on timing, language, beat sync, and progress.',
        icon: CheckCircle2,
        tone: 'green',
        visual: 'features',
        features: FEATURE_LIST,
      },
    ],
    [beatCount]
  )

  useEffect(() => {
    trackEvent('howitworks_view', {
      page_path: '/howitworks',
      beat_count: beatCount,
    })
  }, [beatCount])

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (reduceMotion) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 4500)

    return () => window.clearInterval(timer)
  }, [slides.length])

  const handleStartClick = () => {
    trackEvent('howitworks_cta_click', {
      cta: 'start_practice',
      location: 'blueprint',
    })
    handleStart()
  }

  const handleDownloadClick = () => {
    trackEvent('howitworks_cta_click', {
      cta: 'get_app',
      location: 'blueprint',
    })
    router.push('/download')
  }

  const moveSlide = (direction: -1 | 1) => {
    setActiveIndex((current) => {
      const next = current + direction
      if (next < 0) return slides.length - 1
      if (next >= slides.length) return 0
      return next
    })
  }

  return (
    <div className="flex flex-col items-center gap-4 pb-4 text-center sm:gap-6">
      <div className="mx-auto max-w-xl">
        <StatusBadge tone="info">4-step practice loop</StatusBadge>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:mt-3 sm:text-3xl">
          Swipe through the blueprint.
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary sm:mt-2 sm:text-base">
          Pick a track, shape the session, enter the stage, then keep your
          progress moving.
        </p>
      </div>

      <div className="w-full">
        <div className="mx-auto h-[420px] w-full max-w-[350px] overflow-hidden rounded-[2rem] border border-white/10 bg-surface-elevation-1/80 shadow-surface-2 ring-1 ring-white/5 sm:h-[560px]">
          <div
            className="flex h-full transition-transform duration-700 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {slides.map((slide) => (
              <article
                key={slide.id}
                aria-hidden={slides[activeIndex].id !== slide.id}
                className="flex h-full min-w-full flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(125,122,255,0.22),transparent_18rem)] p-6 text-left"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <IconFrame
                      icon={slide.icon}
                      variant="feature"
                      tone={slide.tone}
                      decorative
                    />
                    {slide.step ? (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent-purple/45 bg-accent-purple/10 text-sm font-black text-accent-purple">
                        {slide.step}
                      </span>
                    ) : (
                      <span className="rounded-full border border-accent-green/25 bg-accent-green/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-green">
                        Tools
                      </span>
                    )}
                  </div>

                  <h3 className="mt-6 text-2xl font-black leading-tight tracking-tight text-white">
                    {slide.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {slide.body}
                  </p>
                </div>

                <SlideVisual slide={slide} beatCount={beatCount} />
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => moveSlide(-1)}
            aria-label="Previous how it works slide"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2" aria-label="Slide controls">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show slide ${index + 1}`}
                aria-current={activeIndex === index ? 'step' : undefined}
                className={cn(
                  'h-3 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple',
                  activeIndex === index
                    ? 'w-8 bg-accent-purple'
                    : 'w-3 bg-white/25 hover:bg-white/40'
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => moveSlide(1)}
            aria-label="Next how it works slide"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="hidden w-full max-w-md grid-cols-2 gap-3 sm:grid">
        <Button
          variant="primary"
          size="lg"
          className="px-7 text-base"
          onClick={handleStartClick}
        >
          Start Practice
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="px-7 text-base"
          onClick={handleDownloadClick}
        >
          Get the App
        </Button>
      </div>
    </div>
  )
}

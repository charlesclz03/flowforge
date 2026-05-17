'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Languages,
  Mic,
  Music,
  Sparkles,
  Timer,
  Zap,
  Target,
} from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { IconFrame } from '@/components/atoms/IconFrame'
import { Surface } from '@/components/atoms/Surface'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { QASection } from '@/components/organisms/landing/QASection'
import { trackEvent } from '@/lib/analytics/track'

interface HowItWorksContentProps {
  onStartPractice?: () => void
  beatCount?: number
}

export function HowItWorksContent({
  onStartPractice,
  beatCount = 10,
}: HowItWorksContentProps) {
  const router = useRouter()
  const handleStart =
    onStartPractice || (() => router.push('/difficultyselection'))

  useEffect(() => {
    trackEvent('howitworks_view', {
      page_path: '/howitworks',
      beat_count: beatCount,
    })
  }, [beatCount])

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

  return (
    <div className="space-y-12">
      <Surface
        tone="glass"
        padding="lg"
        className="grid gap-6 rounded-3xl lg:grid-cols-[1fr_1.05fr] lg:items-center"
      >
        <div className="text-left">
          <StatusBadge tone="info">Live practice preview</StatusBadge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Setup, stage, review. One focused loop.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
            FreeStyla keeps the workflow tight: choose a beat, set the prompt
            cadence, enter the orb stage, then review your take with saved
            session context.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Beat', value: `${beatCount}+`, tone: 'purple' },
            { label: 'Language', value: 'EN / FR / PT', tone: 'cyan' },
            { label: 'Review', value: 'Saved takes', tone: 'green' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-black/25 p-4 text-left shadow-surface-1"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                {item.label}
              </p>
              <p
                className={`mt-3 text-xl font-semibold ${
                  item.tone === 'cyan'
                    ? 'text-accent-cyan'
                    : item.tone === 'green'
                      ? 'text-accent-green'
                      : 'text-accent-purple'
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </Surface>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Step 1 */}
        <div className="rounded-2xl border border-white/10 bg-surface-elevation-1/70 p-6 shadow-surface-1 transition-colors duration-300 hover:border-accent-purple/35">
          <IconFrame
            icon={Music}
            variant="feature"
            tone="blue"
            decorative
            className="mb-6"
          />
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent-purple text-lg font-bold text-accent-purple">
                1
              </span>
              <h2 className="text-lg sm:text-xl font-bold">
                Secure Your Sound
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              Select from a curated library of hip-hop instrumentals. Each beat
              is tagged with BPM and genre for the perfect vibe.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl border border-white/10 bg-surface-elevation-1/70 p-6 shadow-surface-1 transition-colors duration-300 hover:border-accent-purple/35">
          <IconFrame
            icon={Target}
            variant="feature"
            tone="purple"
            decorative
            className="mb-6"
          />
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent-purple text-lg font-bold text-accent-purple">
                2
              </span>
              <h2 className="text-lg sm:text-xl font-bold">
                Architect Your Flow
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              Choose your difficulty, word frequency, and prompt language.
              Freestyle in English, French, or Portuguese before you even enter
              the session.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl border border-white/10 bg-surface-elevation-1/70 p-6 shadow-surface-1 transition-colors duration-300 hover:border-accent-purple/35">
          <IconFrame
            icon={Mic}
            variant="feature"
            tone="purple"
            decorative
            className="mb-6"
          />
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent-purple text-lg font-bold text-accent-purple">
                3
              </span>
              <h2 className="text-lg sm:text-xl font-bold">
                Immortalize Your Bars
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              Hit play and start freestyling. Words appear in sync with the
              beat. Your performance is tracked so you can review progress and,
              on Pro, save the full take.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-gold/20 bg-surface-elevation-1/70 p-6 shadow-surface-1">
          <div className="flex items-start space-x-4">
            <IconFrame
              icon={Languages}
              variant="action"
              tone="gold"
              decorative
              className="mt-1"
            />
            <div>
              <h2 className="mb-2 text-lg font-semibold">
                Language-first practice
              </h2>
              <p className="text-sm text-text-secondary">
                Pick prompt language up front and train your flow in{' '}
                <strong className="text-white">
                  English, French, or Portuguese
                </strong>
                . On iPhone and iPad, prompts stay visual during practice so the
                beat volume stays strong.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-accent-purple/20 bg-surface-elevation-1/70 p-6 shadow-surface-1">
          <div className="flex items-start space-x-4">
            <IconFrame
              icon={Timer}
              variant="action"
              tone="purple"
              decorative
              className="mt-1"
            />
            <div>
              <h2 className="mb-2 text-lg font-semibold">Precision timing</h2>
              <p className="text-sm text-text-secondary">
                Standard sessions run for 10 minutes, giving you enough room to
                build momentum without losing focus.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-accent-purple/20 bg-surface-elevation-1/70 p-6 shadow-surface-1">
          <div className="flex items-start space-x-4">
            <IconFrame
              icon={Sparkles}
              variant="action"
              tone="purple"
              decorative
              className="mt-1"
            />
            <div>
              <h2 className="mb-2 text-lg font-semibold">
                Freestyle practice engine with beats
              </h2>
              <p className="text-sm text-text-secondary">
                Our Beat Vault adapts to your skill level, helping you learn{' '}
                <strong className="text-white">how to improve rap flow</strong>{' '}
                in real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-accent-cyan/20 bg-surface-elevation-1/70 p-6 shadow-surface-1">
          <div className="flex items-start space-x-4">
            <IconFrame
              icon={Zap}
              variant="action"
              tone="blue"
              decorative
              className="mt-1"
            />
            <div>
              <h2 className="mb-2 text-lg font-semibold">
                Beat synchronization
              </h2>
              <p className="text-sm text-text-secondary">
                Words appear precisely timed to musical bars. Choose between 2,
                4, 8, or 16 bar intervals.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-accent-green/20 bg-surface-elevation-1/70 p-6 shadow-surface-1">
          <div className="flex items-start space-x-4">
            <IconFrame
              icon={Music}
              variant="action"
              tone="green"
              decorative
              className="mt-1"
            />
            <div>
              <h2 className="mb-2 text-lg font-semibold">Session tracking</h2>
              <p className="text-sm text-text-secondary">
                Every run feeds your progress history. Pro users can also save,
                replay, and download their recordings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center pt-2 space-x-4">
        <Button
          variant="primary"
          size="lg"
          className="bg-accent-purple px-10 py-4 text-lg text-white shadow-purple-glow hover:scale-[1.02] hover:shadow-glow"
          onClick={handleStartClick}
        >
          Start
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="px-10 py-4 text-lg border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-colors"
          onClick={handleDownloadClick}
        >
          Get the App
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center space-x-8 pt-4 text-center text-sm text-text-secondary">
        <div>
          <div className="mb-1 text-2xl sm:text-3xl text-text-primary">
            {beatCount}+
          </div>
          <div>Curated beats</div>
        </div>
        <div className="h-12 w-px bg-white/10" />
        <div>
          <div className="mb-1 text-2xl sm:text-3xl text-text-primary">
            1,000+
          </div>
          <div>Word vault across EN / FR / PT</div>
        </div>
        <div className="h-12 w-px bg-white/10" />
        <div>
          <div className="mb-1 text-2xl sm:text-3xl text-text-primary">
            10 min
          </div>
          <div>Session time</div>
        </div>
      </div>

      <QASection />
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { Music, Timer, Mic, Sparkles, Zap, Target } from 'lucide-react'
import { Button } from '@/components/atoms/Button'

interface HowItWorksContentProps {
  onStartPractice?: () => void
  beatCount?: number
}

import { QASection } from '@/components/organisms/landing/QASection'

export function HowItWorksContent({
  onStartPractice,
  beatCount = 10,
}: HowItWorksContentProps) {
  const router = useRouter()
  const handleStart =
    onStartPractice || (() => router.push('/difficultyselection'))

  return (
    <div className="space-y-12">
      {/* How It Works Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Step 1 */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/40 transition-all duration-300 hover:scale-105 hover:border-accent-purple/40">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20">
            <Music className="h-7 w-7 text-blue-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl sm:text-3xl">1</span>
              <h3 className="text-lg sm:text-xl">Secure Your Sound</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Select from a curated library of hip-hop instrumentals. Each beat
              is tagged with BPM and genre for the perfect vibe.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/40 transition-all duration-300 hover:scale-105 hover:border-accent-purple/40">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-purple/20">
            <Target className="h-7 w-7 text-accent-purple" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl sm:text-3xl">2</span>
              <h3 className="text-lg sm:text-xl">Architect Your Flow</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Set your difficulty level and word frequency. Start easy with 2-3
              syllable words, or challenge yourself with complex vocabulary.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/40 transition-all duration-300 hover:scale-105 hover:border-accent-purple/40">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20">
            <Mic className="h-7 w-7 text-violet-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl sm:text-3xl">3</span>
              <h3 className="text-lg sm:text-xl">Immortalize Your Bars</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Hit play and start freestyling. Words appear in sync with the
              beat. Your session is automatically recorded for review.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-purple/20 bg-gradient-to-br from-accent-purple/10 to-transparent p-6">
          <div className="flex items-start space-x-4">
            <Timer className="mt-1 h-6 w-6 flex-shrink-0 text-accent-purple" />
            <div>
              <h4 className="mb-2 text-lg">Precision timing</h4>
              <p className="text-sm text-text-secondary">
                your session. Standard sessions run for 2 minutes, perfect for
                daily practice.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent p-6">
          <div className="flex items-start space-x-4">
            <Sparkles className="mt-1 h-6 w-6 flex-shrink-0 text-violet-400" />
            <div>
              <h4 className="mb-2 text-lg">
                Freestyle practice engine with beats
              </h4>
              <p className="text-sm text-text-secondary">
                Our Beat Vault adapts to your skill level, helping you learn{' '}
                <strong className="text-white">how to improve rap flow</strong>{' '}
                in real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent p-6">
          <div className="flex items-start space-x-4">
            <Zap className="mt-1 h-6 w-6 flex-shrink-0 text-blue-400" />
            <div>
              <h4 className="mb-2 text-lg">Beat synchronization</h4>
              <p className="text-sm text-text-secondary">
                Words appear precisely timed to musical bars. Choose between 2,
                4, or 8 bar intervals.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent p-6">
          <div className="flex items-start space-x-4">
            <Music className="mt-1 h-6 w-6 flex-shrink-0 text-green-400" />
            <div>
              <h4 className="mb-2 text-lg">Auto-recording</h4>
              <p className="text-sm text-text-secondary">
                Every session is captured automatically. Review your
                performances and track your progress over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center pt-2">
        <Button
          variant="primary"
          size="lg"
          className="bg-gradient-to-r from-accent-purple to-accent-purple/80 px-10 py-4 text-lg text-black shadow-purple hover:scale-105 hover:shadow-glow"
          onClick={handleStart}
        >
          Start
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
          <div>Word vault</div>
        </div>
        <div className="h-12 w-px bg-white/10" />
        <div>
          <div className="mb-1 text-2xl sm:text-3xl text-text-primary">
            2 min+
          </div>
          <div>Session time</div>
        </div>
      </div>

      <QASection />
    </div>
  )
}

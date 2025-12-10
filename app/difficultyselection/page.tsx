'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { DifficultySelector } from '@/components/molecules/practice/DifficultySelector'
import { BeatDropdown } from '@/components/molecules/practice/BeatDropdown'
import { FrequencySelector } from '@/components/molecules/practice/FrequencySelector'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { Button } from '@/components/atoms/Button'
import { Beat } from '@/types/database'
import { SESSION_CONFIG } from '@/lib/constants/design'
import { ErrorCodes } from '@/lib/errors'
import { usePracticeSession } from '@/contexts/SessionContext'
import { useErrorHandler } from '@/hooks/useErrorHandler'

type Frequency = 4 | 8 | 16

export default function DifficultySelectionPage() {
  const router = useRouter()
  const { error, handleError, clearError } = useErrorHandler()
  const { selectedBeat, frequency, difficulty, setBeat, setFrequency, setDifficulty } =
    usePracticeSession()

  const [beats, setBeats] = useState<Beat[]>([])
  const [isLoadingBeats, setIsLoadingBeats] = useState(true)

  // Fetch beats for selection
  useEffect(() => {
    async function fetchBeats() {
      try {
        const response = await fetch('/api/beats')
        const data = await response.json()
        setBeats(data.beats || [])
      } catch (err) {
        handleError(err, ErrorCodes.FETCH_BEATS_FAILED)
        setBeats([])
      } finally {
        setIsLoadingBeats(false)
      }
    }

    fetchBeats()
  }, [handleError])

  const canStart = !!selectedBeat

  return (
    <OnboardingLayout showBackButton onBack={() => router.push('/howitworks')}>
      <div className="space-y-8">
        {/* Error alert */}
        {error && <ErrorAlert error={error} onDismiss={clearError} />}

        {/* Title */}
        <div className="space-y-3 text-center">
          <h1 className="text-4xl sm:text-5xl">Setup your session</h1>
          <p className="text-base text-text-secondary sm:text-lg">
            Choose your difficulty, word frequency, and beat.
          </p>
        </div>

        {/* Configuration Sliders */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
          <DifficultySelector
            value={difficulty || SESSION_CONFIG.DEFAULT_DIFFICULTY}
            onChange={setDifficulty}
            disabled={false}
          />
          <FrequencySelector
            value={(frequency as Frequency) || (SESSION_CONFIG.DEFAULT_FREQUENCY as Frequency)}
            onChange={(val) => setFrequency(val)}
            disabled={false}
          />
          <BeatDropdown
            beats={beats}
            selectedBeat={selectedBeat}
            onSelect={setBeat}
            disabled={isLoadingBeats}
          />
        </div>

        {/* Continue button */}
        <div className="flex justify-center pt-2">
          <Button
            variant="primary"
            size="lg"
            className={`rounded-full px-10 py-4 text-lg ${
              canStart
                ? 'bg-gradient-to-r from-accent-purple to-accent-purple/80 text-black shadow-purple hover:scale-105 hover:shadow-glow'
                : 'bg-white/10 text-text-secondary cursor-not-allowed'
            }`}
            disabled={!canStart}
            onClick={() => {
              if (!selectedBeat) return
              router.push('/practice')
            }}
          >
            {canStart ? 'Practice' : 'Select a beat to continue'}
          </Button>
        </div>

        {/* Beat counts */}
        {!isLoadingBeats && beats.length > 0 && (
          <div className="text-center text-sm text-text-secondary">
            {beats.filter((b) => !b.isPremium).length} free beats •{' '}
            {beats.filter((b) => b.isPremium).length} premium beats
          </div>
        )}
      </div>
    </OnboardingLayout>
  )
}

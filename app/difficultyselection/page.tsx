'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { ChevronDown, Sparkles, User, Users, Mic } from 'lucide-react'
import { Switch } from '@/components/atoms/Switch'
import { cn } from '@/lib/utils'

type Frequency = 4 | 8 | 16

import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'
import { useSession } from 'next-auth/react'
import { DailyStreakWidget } from '@/components/molecules/gamification/DailyStreakWidget'

export default function DifficultySelectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { error, handleError, clearError } = useErrorHandler()
  const {
    selectedBeat,
    frequency,
    difficulty,
    setBeat,
    setFrequency,
    setDifficulty,
    mode,
    setMode,
    wordCategory,
    setWordCategory,
    cypherPlayers,
    setCypherPlayers,
    isRecordingEnabled,
    setIsRecordingEnabled,
  } = usePracticeSession()

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const isPro =
    session?.user?.subscriptionStatus === 'active' ||
    session?.user?.subscriptionStatus === 'trialing'

  const [beats, setBeats] = useState<Beat[]>([])
  const [isLoadingBeats, setIsLoadingBeats] = useState(true)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  // Handle Pre-selection from Tracks Page
  useEffect(() => {
    const beatId = searchParams.get('beatId')
    if (beatId && beats.length > 0) {
      const beat = beats.find((b) => b.id === beatId)
      if (beat) {
        setBeat(beat)
      }
    }
  }, [searchParams, beats, setBeat])

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent sm:text-6xl">
            Freestyle Session
          </h1>
          <p className="text-base text-text-secondary sm:text-lg">
            Choose your difficulty, word frequency, and beat.
          </p>
        </div>

        {/* Gamification Hub */}
        <div className="max-w-md mx-auto w-full">
          <DailyStreakWidget
            currentStreak={session?.user?.currentStreak || 0}
            hasPracticedToday={false}
          />
        </div>

        {/* Configuration Sliders */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
          <DifficultySelector
            value={difficulty || SESSION_CONFIG.DEFAULT_DIFFICULTY}
            onChange={setDifficulty}
            disabled={false}
          />
          <FrequencySelector
            value={
              (frequency as Frequency) ||
              (SESSION_CONFIG.DEFAULT_FREQUENCY as Frequency)
            }
            onChange={(val) => setFrequency(val)}
            disabled={false}
          />

          {/* Recording Toggle */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center transition-colors',
                  isRecordingEnabled
                    ? 'bg-red-500/20 text-red-500'
                    : 'bg-white/10 text-text-tertiary'
                )}
              >
                <Mic size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Capture the Audio
                </p>
                <p className="text-xs text-text-tertiary">
                  {isRecordingEnabled
                    ? 'Audio will be recorded'
                    : 'Stealth Mode (No Recording)'}
                </p>
              </div>
            </div>
            <Switch
              checked={isRecordingEnabled}
              onCheckedChange={setIsRecordingEnabled}
              className="data-[state=checked]:bg-red-500"
            />
          </div>

          <BeatDropdown
            beats={beats}
            selectedBeat={selectedBeat}
            handleSelect={setBeat}
            disabled={isLoadingBeats}
            handleLockedSelect={() => setShowPremiumModal(true)}
            isPro={isPro}
            embedded={true}
            defaultCollapsed={!!searchParams.get('beatId')}
          />

          {/* Advanced Section */}
          <div className="pt-2">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-white transition-colors group"
            >
              <div
                className={cn(
                  'p-1 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors',
                  isAdvancedOpen && 'bg-accent-purple/20 text-accent-purple'
                )}
              >
                <ChevronDown
                  className={cn(
                    'transition-transform duration-300',
                    isAdvancedOpen && 'rotate-180'
                  )}
                  size={14}
                />
              </div>
              <span>Advanced Settings</span>
              {!isAdvancedOpen && (wordCategory || mode === 'cypher') && (
                <div className="h-1.5 w-1.5 rounded-full bg-accent-purple animate-pulse ml-1" />
              )}
            </button>

            {isAdvancedOpen && (
              <div className="mt-6 space-y-8 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
                {/* Session Mode Selector */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                    Session Mode
                  </label>
                  <div className="relative flex bg-black/40 p-1.5 rounded-2xl border border-white/5 h-16">
                    {/* Animated Background Highlight */}
                    <div
                      className={cn(
                        'absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-accent-blue rounded-xl transition-all duration-300 shadow-lg shadow-accent-blue/20',
                        mode === 'cypher'
                          ? 'left-[calc(50%+1.5px)]'
                          : 'left-1.5'
                      )}
                    />

                    <button
                      onClick={() => setMode('solo')}
                      className={cn(
                        'relative z-10 flex-1 flex items-center justify-center gap-3 rounded-xl font-bold transition-colors duration-300',
                        mode === 'solo'
                          ? 'text-white'
                          : 'text-text-secondary hover:text-white'
                      )}
                    >
                      <User size={18} />
                      <span className="text-lg">Solo</span>
                    </button>
                    <button
                      onClick={() => setMode('cypher')}
                      className={cn(
                        'relative z-10 flex-1 flex items-center justify-center gap-3 rounded-xl font-bold transition-colors duration-300',
                        mode === 'cypher'
                          ? 'text-white'
                          : 'text-text-secondary hover:text-white'
                      )}
                    >
                      <Users size={18} />
                      <span className="text-lg">Cypher</span>
                    </button>
                  </div>

                  {/* Cypher Player Selector (Expands when Cypher is selected) */}
                  {mode === 'cypher' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-secondary">
                          Number of Players
                        </label>
                        <div className="flex items-center gap-3">
                          {[2, 3, 4, 5].map((count) => (
                            <button
                              key={count}
                              onClick={() => setCypherPlayers(count)}
                              className={cn(
                                'h-10 w-10 rounded-lg border font-bold transition-all',
                                cypherPlayers === count
                                  ? 'bg-accent-blue border-accent-blue text-white shadow-glow-sm'
                                  : 'bg-black/20 border-white/10 text-text-secondary hover:border-white/20'
                              )}
                            >
                              {count}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary italic">
                        Players will take turns every {frequency} bars.
                      </p>
                    </div>
                  )}
                </div>

                {/* Theme Dropdown */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                    Word Theme
                    <Sparkles size={12} className="text-accent-orange" />
                  </label>
                  <select
                    value={wordCategory || 'All'}
                    onChange={(e) =>
                      setWordCategory(
                        e.target.value === 'All' ? null : e.target.value
                      )
                    }
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple appearance-none"
                  >
                    {[
                      'All',
                      'Street',
                      'Political',
                      'Abstract',
                      'Nature',
                      'Ego Trip',
                      'Life',
                    ].map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
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
      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        trigger="beat"
      />
    </OnboardingLayout>
  )
}

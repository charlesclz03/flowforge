'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { BeatDropdown } from '@/components/molecules/practice/BeatDropdown'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { Button } from '@/components/atoms/Button'
import { Surface } from '@/components/atoms/Surface'
import { SegmentedControl } from '@/components/atoms/SegmentedControl'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { Beat } from '@/types/database'
import { SESSION_CONFIG } from '@/lib/constants/design'
import { usePracticeSession } from '@/contexts/SessionContext'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useDevice } from '@/hooks/useDevice'
import {
  ChevronDown,
  Disc3,
  Gauge,
  Languages,
  Mic,
  Radio,
  Settings2,
  User,
  Users,
} from 'lucide-react'
import { Switch } from '@/components/atoms/Switch'
import { cn } from '@/lib/utils'
import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'
import { useSession } from 'next-auth/react'
import { isProUser } from '@/lib/subscription/isPro'
import { useTTS } from '@/hooks/useTTS'
import { TTS_LANGUAGE_OPTIONS, type TTSLanguageCode } from '@/lib/tts/languages'
import { IOS_SPOKEN_PROMPT_NOTICE } from '@/lib/tts/platform'
import { trackEvent } from '@/lib/analytics/track'

type Frequency = 2 | 4 | 8 | 16

interface DifficultySelectionClientProps {
  initialBeats: Beat[]
}

const LANGUAGE_FLAGS: Record<TTSLanguageCode, string> = {
  'en-US': '/flags/us.svg',
  'fr-FR': '/flags/fr.svg',
  'pt-PT': '/flags/pt.svg',
}

const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Easy', description: 'More room to warm up.' },
  { value: 2, label: 'Sharp', description: 'Balanced prompt pressure.' },
  { value: 3, label: 'Elite', description: 'Faster switches, tighter flow.' },
]

const FREQUENCY_OPTIONS: Array<{
  value: Frequency
  label: string
  description: string
}> = [
  { value: 2, label: '2 bars', description: 'Rapid-fire changes.' },
  { value: 4, label: '4 bars', description: 'Classic freestyle cadence.' },
  { value: 8, label: '8 bars', description: 'Longer pockets.' },
  { value: 16, label: '16 bars', description: 'Full verse runs.' },
]

export function DifficultySelectionClient({
  initialBeats,
}: DifficultySelectionClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: sessionStatus } = useSession()
  const { error, clearError, handleError } = useErrorHandler()
  const { isIOS } = useDevice()
  const {
    selectedBeat,
    frequency,
    difficulty,
    setBeat,
    setFrequency,
    setDifficulty,
    mode,
    setMode,
    cypherPlayers,
    setCypherPlayers,
    selectedLanguage,
    setSelectedLanguage,
    isRecordingEnabled,
    setIsRecordingEnabled,
  } = usePracticeSession()

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [userBeats, setUserBeats] = useState<Beat[]>([])
  const [hasResolvedUserBeats, setHasResolvedUserBeats] = useState(false)
  const missingBeatIdRef = useRef<string | null>(null)

  const isPro = isProUser(session?.user)

  // Use initial beats passed from server
  const [beats] = useState<Beat[]>(initialBeats)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  const beatsById = useMemo(() => {
    const index = new Map<string, Beat>()

    for (const beat of beats) {
      index.set(beat.id, beat)
    }
    for (const beat of userBeats) {
      index.set(beat.id, beat)
    }

    return index
  }, [beats, userBeats])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const loadUserBeats = async () => {
      if (sessionStatus === 'loading') return

      if (sessionStatus !== 'authenticated' || !isPro) {
        if (isMounted) {
          setUserBeats([])
          setHasResolvedUserBeats(true)
        }
        return
      }

      setHasResolvedUserBeats(false)

      try {
        const res = await fetch('/api/user/beats', {
          cache: 'no-store',
          signal: controller.signal,
        })

        if (!res.ok) {
          if (isMounted) setUserBeats([])
          return
        }

        const data = await res.json()
        if (isMounted) {
          setUserBeats(Array.isArray(data?.beats) ? data.beats : [])
        }
      } catch (err) {
        if (isMounted && (err as Error).name !== 'AbortError') {
          console.error('Failed to fetch user beats for beat handoff', err)
          setUserBeats([])
        }
      } finally {
        if (isMounted) {
          setHasResolvedUserBeats(true)
        }
      }
    }

    void loadUserBeats()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [isPro, sessionStatus])

  // Handle URL Params (Beat, Mode, Advanced Settings)
  useEffect(() => {
    const canResolveBeatId =
      sessionStatus !== 'loading' &&
      (sessionStatus !== 'authenticated' || !isPro || hasResolvedUserBeats)

    // 1. Beat Selection
    const beatId = searchParams.get('beatId')
    if (beatId && canResolveBeatId) {
      const beat = beatsById.get(beatId)
      if (beat) {
        setBeat(beat)
        clearError()
        missingBeatIdRef.current = null
      } else {
        setBeat(null)
        if (missingBeatIdRef.current !== beatId) {
          handleError(
            new Error(
              'Selected track was not found. Please select a beat manually.'
            ),
            'BEAT_NOT_FOUND'
          )
          missingBeatIdRef.current = beatId
        }
      }
    }

    // 2. Mode Selection
    const modeParam = searchParams.get('mode')
    if (modeParam === 'cypher') {
      setMode('cypher')
    }

    // 3. Advanced Settings Expansion
    const advancedParam = searchParams.get('advanced')
    if (advancedParam === 'true') {
      setIsAdvancedOpen(true)
    }
  }, [
    beatsById,
    clearError,
    handleError,
    hasResolvedUserBeats,
    isPro,
    searchParams,
    sessionStatus,
    setBeat,
    setMode,
  ])

  const canStart = !!selectedBeat
  const { activeVoice, voiceStatus } = useTTS({
    enabled: false,
    language: selectedLanguage,
  })
  const voiceStatusMessage = useMemo(() => {
    if (isIOS) {
      return IOS_SPOKEN_PROMPT_NOTICE
    }

    if (voiceStatus === 'unsupported') {
      return 'Voice prompts are unavailable in this browser.'
    }

    if (voiceStatus === 'fallback') {
      const fallbackLabel = activeVoice?.name
        ? `Using fallback voice: ${activeVoice.name}.`
        : 'Using a fallback voice.'
      return `${fallbackLabel} Install a matching language voice for best results.`
    }

    if (voiceStatus === 'loading') {
      return 'Checking installed voice packs...'
    }

    return null
  }, [isIOS, voiceStatus, activeVoice])

  const activeLanguageLabel =
    TTS_LANGUAGE_OPTIONS.find((option) => option.code === selectedLanguage)
      ?.label ?? 'English'
  const selectedDifficulty = difficulty || SESSION_CONFIG.DEFAULT_DIFFICULTY
  const selectedFrequency =
    (frequency as Frequency) || (SESSION_CONFIG.DEFAULT_FREQUENCY as Frequency)
  const recordingModeLabel = isRecordingEnabled ? 'Record' : 'No record'

  return (
    <OnboardingLayout
      showBackButton
      onBack={() => router.push('/howitworks')}
      customTitle="SKILL CHECK"
      customSubtitle="Choose your challenge level"
    >
      <div className="space-y-4 sm:space-y-6">
        {error && <ErrorAlert error={error} onDismiss={clearError} />}

        <Surface tone="glass" padding="lg" className="space-y-5 rounded-3xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <StatusBadge tone={canStart ? 'success' : 'info'}>
                {canStart ? 'Ready to launch' : 'Choose a beat'}
              </StatusBadge>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Practice setup
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                Tune the session before entering the stage.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[270px]">
              <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
                  Bars
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {selectedFrequency}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
                  Mode
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {mode === 'cypher' ? 'Cypher' : 'Solo'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
                  Audio
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {recordingModeLabel}
                </p>
              </div>
            </div>
          </div>

          <SegmentedControl
            label="Difficulty"
            value={selectedDifficulty}
            onChange={setDifficulty}
            columns={3}
            options={DIFFICULTY_OPTIONS.map((option) => ({
              ...option,
              icon: <Gauge size={16} />,
            }))}
          />

          <SegmentedControl
            label="Prompt cadence"
            value={selectedFrequency}
            onChange={setFrequency}
            columns={4}
            options={FREQUENCY_OPTIONS.map((option) => ({
              ...option,
              icon: <Radio size={16} />,
            }))}
          />

          <BeatDropdown
            beats={beats}
            selectedBeat={selectedBeat}
            handleSelect={setBeat}
            disabled={false}
            handleLockedSelect={() => setShowPremiumModal(true)}
            isPro={isPro}
            embedded={true}
            defaultCollapsed={true}
          />

          <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Languages size={16} className="text-accent-cyan" />
                Prompt language
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TTS_LANGUAGE_OPTIONS.map((option) => {
                  const isActive = selectedLanguage === option.code
                  return (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => setSelectedLanguage(option.code)}
                      className={cn(
                        'flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl border text-sm font-semibold transition-all',
                        isActive
                          ? 'border-accent-purple/50 bg-accent-purple/20 text-white shadow-purple-glow'
                          : 'border-white/10 bg-black/20 text-text-secondary hover:border-white/20 hover:bg-white/10 hover:text-white'
                      )}
                      aria-pressed={isActive}
                    >
                      <Image
                        src={LANGUAGE_FLAGS[option.code]}
                        alt=""
                        aria-hidden
                        width={24}
                        height={16}
                        className="h-4 w-6 rounded-[2px] object-cover"
                      />
                      <span>{option.label}</span>
                    </button>
                  )
                })}
              </div>
              {voiceStatusMessage && (
                <p
                  className="mt-3 text-xs leading-relaxed text-text-tertiary"
                  role="status"
                  aria-live="polite"
                >
                  {voiceStatusMessage}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Mic
                  size={16}
                  className={
                    isRecordingEnabled
                      ? 'text-accent-red'
                      : 'text-text-tertiary'
                  }
                />
                Recording mode
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/25 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {isRecordingEnabled ? 'Capture audio' : 'Practice only'}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-text-tertiary">
                    {isRecordingEnabled
                      ? 'Save this take for review after the session.'
                      : 'Run prompts without saving microphone audio.'}
                  </p>
                </div>
                <Switch
                  checked={isRecordingEnabled}
                  onCheckedChange={(checked) => {
                    trackEvent('recording_mode_toggle', {
                      enabled: checked,
                      surface: 'difficultyselection',
                    })
                    setIsRecordingEnabled(checked)
                  }}
                  ariaLabel="Toggle recording mode"
                  className="data-[state=checked]:bg-accent-red"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex min-h-[44px] w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Settings2 size={16} />
                Session mode
                {!isAdvancedOpen && mode === 'cypher' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-purple" />
                )}
              </span>
              <ChevronDown
                className={cn(
                  'transition-transform duration-300',
                  isAdvancedOpen && 'rotate-180'
                )}
                size={16}
              />
            </button>

            {isAdvancedOpen && (
              <div className="mt-3 space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'solo' as const, label: 'Solo', icon: User },
                    { value: 'cypher' as const, label: 'Cypher', icon: Users },
                  ].map((option) => {
                    const Icon = option.icon
                    const isActive = mode === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMode(option.value)}
                        className={cn(
                          'flex min-h-[56px] items-center justify-center gap-2 rounded-xl border font-semibold transition-all',
                          isActive
                            ? 'border-accent-purple/50 bg-accent-purple/20 text-white shadow-purple-glow'
                            : 'border-white/10 bg-black/25 text-text-secondary hover:border-white/20 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        <Icon size={18} />
                        {option.label}
                      </button>
                    )
                  })}
                </div>

                {mode === 'cypher' && (
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm font-medium text-text-secondary">
                        Players
                      </label>
                      <div className="flex items-center gap-2">
                        {[2, 3, 4].map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setCypherPlayers(count)}
                            className={cn(
                              'h-10 w-10 rounded-xl border font-bold transition-all',
                              cypherPlayers === count
                                ? 'border-accent-purple bg-accent-purple/20 text-white shadow-purple-glow'
                                : 'border-white/10 bg-black/25 text-text-secondary hover:border-white/20'
                            )}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-text-secondary">
                      Players rotate every {selectedFrequency} bars.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/25 p-3 text-xs text-text-secondary sm:grid-cols-3">
            <span className="flex items-center gap-2 truncate">
              <Disc3 size={14} className="text-accent-purple" />
              {selectedBeat?.title ?? 'No beat selected'}
            </span>
            <span>{activeLanguageLabel}</span>
            <span>{selectedDifficulty}/3 difficulty</span>
          </div>
        </Surface>

        <div className="flex justify-center pt-2">
          <Button
            variant="primary"
            size="lg"
            className={`rounded-full px-10 py-4 text-lg ${
              canStart
                ? 'bg-accent-purple text-white shadow-purple-glow hover:scale-[1.02] hover:shadow-glow'
                : 'border border-white/15 bg-white/10 text-white cursor-not-allowed disabled:opacity-100'
            }`}
            disabled={!canStart}
            onClick={() => {
              if (!selectedBeat) return
              trackEvent('practice_start_intent', {
                surface: 'difficultyselection',
                language: selectedLanguage,
                recording: isRecordingEnabled,
                cadence: selectedFrequency,
                difficulty: selectedDifficulty,
              })
              router.push(
                `/practice?lang=${encodeURIComponent(selectedLanguage)}`
              )
            }}
          >
            {canStart ? 'Start Practice' : 'Choose a Beat First'}
          </Button>
        </div>
      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        trigger="beat"
        beatCount={beats.length > 0 ? beats.length : 140}
      />
    </OnboardingLayout>
  )
}

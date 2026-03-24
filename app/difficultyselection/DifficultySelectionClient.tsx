'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Menu } from '@headlessui/react'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { DifficultySelector } from '@/components/molecules/practice/DifficultySelector'
import { BeatDropdown } from '@/components/molecules/practice/BeatDropdown'
import { FrequencySelector } from '@/components/molecules/practice/FrequencySelector'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { Button } from '@/components/atoms/Button'
import { Beat } from '@/types/database'
import { SESSION_CONFIG } from '@/lib/constants/design'
import { usePracticeSession } from '@/contexts/SessionContext'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useDevice } from '@/hooks/useDevice'
import { ChevronDown, User, Users, Mic } from 'lucide-react'
import { Switch } from '@/components/atoms/Switch'
import { cn } from '@/lib/utils'
import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'
import { useSession } from 'next-auth/react'
import { isProUser } from '@/lib/subscription/isPro'
import { useTTS } from '@/hooks/useTTS'
import { TTS_LANGUAGE_OPTIONS, type TTSLanguageCode } from '@/lib/tts/languages'
import { IOS_SPOKEN_PROMPT_NOTICE } from '@/lib/tts/platform'

type Frequency = 4 | 8 | 16

interface DifficultySelectionClientProps {
  initialBeats: Beat[]
}

const LANGUAGE_FLAGS: Record<TTSLanguageCode, string> = {
  'en-US': '/flags/us.svg',
  'fr-FR': '/flags/fr.svg',
  'pt-PT': '/flags/pt.svg',
}

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
  const activeLanguageCode =
    TTS_LANGUAGE_OPTIONS.find((option) => option.code === selectedLanguage)
      ?.code ?? TTS_LANGUAGE_OPTIONS[0].code
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

  return (
    <OnboardingLayout
      showBackButton
      onBack={() => router.push('/howitworks')}
      customTitle="SKILL CHECK"
      customSubtitle="Choose your challenge level"
    >
      {/* Responsive spacing - tighter on small screens */}
      <div className="space-y-4 sm:space-y-8">
        {/* Error alert */}
        {error && <ErrorAlert error={error} onDismiss={clearError} />}

        {/* Configuration Sliders */}
        <div className="space-y-4 sm:space-y-6 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-sm">
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

          {/* Advanced Section */}
          <div className="pt-2">
            <div className="flex min-h-[44px] items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Menu as="div" className="relative shrink-0">
                  <Menu.Button
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/15 bg-white/5 text-lg transition-colors hover:border-white/25 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/70"
                    aria-label="Select language"
                  >
                    <Image
                      src={LANGUAGE_FLAGS[activeLanguageCode]}
                      alt=""
                      aria-hidden
                      width={24}
                      height={16}
                      className="h-4 w-6 rounded-[2px] object-cover"
                    />
                  </Menu.Button>
                  <Menu.Items className="absolute left-0 top-full z-30 mt-2 flex min-w-[138px] items-center gap-1 rounded-xl border border-white/15 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur focus:outline-none">
                    {TTS_LANGUAGE_OPTIONS.map((option) => {
                      const isActive = selectedLanguage === option.code
                      return (
                        <Menu.Item key={option.code}>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() => setSelectedLanguage(option.code)}
                              className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition-colors',
                                isActive
                                  ? 'border-accent-purple bg-accent-purple/20 shadow-[0_0_12px_rgba(125,122,255,0.28)]'
                                  : 'border-white/10 bg-black/20',
                                active &&
                                  !isActive &&
                                  'border-white/20 bg-white/10'
                              )}
                              aria-label={option.label}
                            >
                              <Image
                                src={LANGUAGE_FLAGS[option.code]}
                                alt=""
                                aria-hidden
                                width={24}
                                height={16}
                                className="h-4 w-6 rounded-[2px] object-cover"
                              />
                            </button>
                          )}
                        </Menu.Item>
                      )
                    })}
                  </Menu.Items>
                </Menu>

                <button
                  type="button"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg px-1 text-sm font-medium text-text-secondary transition-colors hover:text-white"
                >
                  <span className="truncate">Advanced Settings</span>
                  {!isAdvancedOpen && mode === 'cypher' && (
                    <div className="ml-1 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent-purple" />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className={cn(
                  'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-white/5 text-text-secondary transition-colors hover:bg-white/10 hover:text-white',
                  isAdvancedOpen && 'bg-accent-purple/20 text-accent-purple'
                )}
                aria-label={
                  isAdvancedOpen
                    ? 'Collapse advanced settings'
                    : 'Expand advanced settings'
                }
              >
                <ChevronDown
                  className={cn(
                    'transition-transform duration-300',
                    isAdvancedOpen && 'rotate-180'
                  )}
                  size={14}
                />
              </button>
            </div>
            {voiceStatusMessage && (
              <p className="mt-2 text-xs text-text-tertiary">
                {voiceStatusMessage}
              </p>
            )}

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
                        'absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-accent-purple/20 border border-accent-purple/30 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(125,122,255,0.2)] backdrop-blur-sm',
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

                  {/* Recording Toggle (Moved from top) */}
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

                  {/* Cypher Player Selector (Expands when Cypher is selected) */}
                  {mode === 'cypher' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-secondary">
                          Number of Players
                        </label>
                        <div className="flex items-center gap-3">
                          {[2, 3, 4].map((count) => {
                            let activeClass = ''
                            switch (count) {
                              case 2: // Orange
                                activeClass =
                                  'bg-accent-orange border-accent-orange shadow-[0_0_15px_rgba(249,115,22,0.5)]'
                                break
                              case 3: // Gold
                                activeClass =
                                  'bg-accent-gold border-accent-gold shadow-[0_0_15px_rgba(255,214,10,0.5)]'
                                break
                              case 4: // Green
                                activeClass =
                                  'bg-accent-green border-accent-green shadow-[0_0_15px_rgba(48,209,88,0.5)]'
                                break
                            }

                            return (
                              <button
                                key={count}
                                onClick={() => setCypherPlayers(count)}
                                className={cn(
                                  'h-10 w-10 rounded-lg border font-bold transition-all flex items-center justify-center',
                                  cypherPlayers === count
                                    ? `${activeClass} text-white`
                                    : 'bg-black/20 border-white/10 text-text-secondary hover:border-white/20'
                                )}
                              >
                                {count}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary italic">
                        Players will take turns every {frequency} bars.
                      </p>
                    </div>
                  )}
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
              router.push(
                `/practice?lang=${encodeURIComponent(selectedLanguage)}`
              )
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
        beatCount={beats.length > 0 ? beats.length : 140}
      />
    </OnboardingLayout>
  )
}

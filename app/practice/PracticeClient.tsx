/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

import { usePracticeSession } from '@/contexts/SessionContext'
import { usePracticeEngine } from '@/hooks/player/usePracticeEngine'
import { useSound } from '@/hooks/useSound'
import { useOptimisticAction } from '@/hooks/useOptimisticAction'
import { Beat } from '@/types/database'
import { SESSION_CONFIG } from '@/lib/constants/design'
import { calculateSessionXP, getLevelInfo } from '@/lib/gamification/xp'
import { isProUser } from '@/lib/subscription/isPro'

// Components
import PracticeControls from '@/components/organisms/practice/PracticeControls'
import { ScreenPage } from '@/components/layout/ScreenPage'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/atoms/Modal'

// Dynamic Imports
const GuestLoginModal = dynamic(
  () =>
    import('@/components/molecules/auth/GuestLoginModal').then(
      (m) => m.GuestLoginModal
    ),
  { ssr: false }
)
const PremiumModal = dynamic(
  () =>
    import('@/components/molecules/monetization/PremiumModal').then(
      (m) => m.PremiumModal
    ),
  { ssr: false }
)
const SessionSummaryModal = dynamic(
  () => import('@/components/molecules/practice/SessionSummaryModal'),
  { ssr: false }
)
const RateAppModal = dynamic(
  () =>
    import('@/components/organisms/feedback/RateAppModal').then(
      (m) => m.RateAppModal
    ),
  { ssr: false }
)

interface PracticeClientProps {
  initialBeats: Beat[]
  initialWords: string[]
}

interface SessionSummary {
  id?: string // Added ID
  score: number
  vibe: string
  description: string
  wordCount: number
  duration: number
  audioUrl?: string
  newBadges: string[]
  difficulty: string
  bpm: number
  frequency: number
  isOptimistic: boolean
  xp?: {
    gained: number
    newLevel: number
    currentXP: number
    maxXP: number
    breakdown: {
      base: number
      duration: number
      words: number
      achievements: number
    }
  }
  meta?: {
    totalSessions: number
    currentStreak: number
    hasRated: boolean
  }
}

export default function PracticeClient({
  initialBeats,
  initialWords,
}: PracticeClientProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { play } = useSound()
  const sessionDurationLimit = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_SESSION_DURATION_SECONDS
    const parsed = raw ? Number(raw) : NaN
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.trunc(parsed)
    }
    return SESSION_CONFIG.DEFAULT_DURATION_SECONDS
  }, [])

  // 1. Context State
  const {
    selectedBeat,
    setBeat,
    frequency,
    difficulty,
    setDifficulty,
    setFrequency,
    isLoaded,
    mode,
    cypherPlayers,
    isRecordingEnabled,
    setIsRecordingEnabled,
  } = usePracticeSession()

  // 2. Local UI State
  const [beats] = useState<Beat[]>(initialBeats)
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(
    null
  )
  const [uiTime, setUiTime] = useState(0)
  const didAutoStopRef = useRef(false)

  // If the user lands directly on /practice (no prior selection), auto-pick a safe default.
  useEffect(() => {
    if (!isLoaded) return
    if (selectedBeat) return
    if (beats.length === 0) return

    const defaultBeat = beats.find((b) => !b.isPremium) || beats[0]
    if (defaultBeat) setBeat(defaultBeat)
  }, [isLoaded, selectedBeat, beats, setBeat])

  // Modals
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const [showRateModal, setShowRateModal] = useState(false)
  const [premiumTrigger, setPremiumTrigger] = useState<'recording' | 'beat'>(
    'beat'
  )
  const [pendingAction, setPendingAction] = useState<
    'exit' | 'restart' | 'finish' | null
  >(null)

  // 3. Setup Optimistic Saver
  const { mutate: saveSessionOptimistic } = useOptimisticAction(
    async (formData: FormData) => {
      const hasAudio = formData.has('audio')
      const numericKeys = new Set([
        'durationSeconds',
        'frequency',
        'difficulty',
        'restarts',
        'playbacks',
        'score',
        'beatOffsetMs',
        'baseWordCount',
        'wordCount',
        'fileSizeBytes',
      ])

      const formDataToJson = (skipBinary: boolean): Record<string, unknown> => {
        const json: Record<string, unknown> = {}
        formData.forEach((value, key) => {
          if (skipBinary && value instanceof Blob) return

          if (key === 'wordsUsed' && typeof value === 'string') {
            try {
              json[key] = JSON.parse(value)
            } catch {
              json[key] = []
            }
            return
          }

          if (numericKeys.has(key) && typeof value === 'string') {
            const parsed = Number(value)
            json[key] = Number.isFinite(parsed) ? parsed : value
            return
          }

          json[key] = value
        })
        return json
      }

      let endpoint = '/api/session/complete'
      let bodyJson = formDataToJson(true)

      if (hasAudio) {
        const audioValue = formData.get('audio')
        if (!(audioValue instanceof Blob)) {
          throw new Error('Recording payload missing audio blob')
        }

        const uploadUrlResponse = await fetch('/api/upload/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: `recording-${Date.now()}.wav`,
            contentType: audioValue.type || 'audio/wav',
          }),
        })

        const uploadUrlData = await uploadUrlResponse.json().catch(() => ({}))
        if (!uploadUrlResponse.ok || !uploadUrlData?.signedUrl) {
          throw new Error(uploadUrlData?.error || 'Failed to create upload URL')
        }

        const uploadResponse = await fetch(uploadUrlData.signedUrl as string, {
          method: 'PUT',
          headers: {
            'Content-Type': audioValue.type || 'audio/wav',
          },
          body: audioValue,
        })

        if (!uploadResponse.ok) {
          throw new Error(
            `Failed to upload recording audio (${uploadResponse.status})`
          )
        }

        bodyJson = {
          ...bodyJson,
          storagePath: uploadUrlData.storagePath,
          fileSizeBytes: audioValue.size,
        }
        endpoint = '/api/recordings'
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyJson),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to save session')
      return data
    },
    {
      onOptimistic: (formData: FormData) => {
        play('success')

        // Parse prediction
        const diffStr = formData.get('difficulty') as string
        const freqVal = parseFloat(formData.get('frequency') as string)
        const durVal = parseFloat(formData.get('durationSeconds') as string)
        const wordCount = JSON.parse(
          (formData.get('wordsUsed') as string) || '[]'
        ).length
        const beatBpm = selectedBeat?.bpm || 0
        const audioValue = formData.get('audio')
        const audioUrl =
          audioValue instanceof Blob
            ? URL.createObjectURL(audioValue)
            : undefined

        const predictedXP = calculateSessionXP({
          durationSeconds: durVal,
          wordCount,
          achievementsUnlocked: 0,
        })

        const currentUserXP = session?.user?.xp || 0
        const levelInfo = getLevelInfo(currentUserXP + predictedXP.total)

        setSessionSummary({
          score: 0,
          vibe: 'Freestyle Flow',
          description: 'Nice session!',
          wordCount,
          duration: durVal,
          audioUrl,
          newBadges: [],
          difficulty: diffStr,
          bpm: beatBpm,
          frequency: freqVal,
          isOptimistic: false, // Show immediately
          xp: {
            gained: predictedXP.total,
            newLevel: levelInfo.level,
            currentXP: levelInfo.currentXP,
            maxXP: levelInfo.maxXP,
            breakdown: predictedXP.breakdown,
          },
        })
      },
      onSuccess: (data) => {
        if (data.session) {
          setSessionSummary((prev) =>
            prev
              ? {
                  ...prev,
                  id: data.session.id, // Add ID
                  score: data.session.score,
                  newBadges: data.session.newBadges,
                  xp: data.session.xp,
                  meta: data.session.meta,
                }
              : null
          )

          if (data.session.newBadges?.length) {
            data.session.newBadges.forEach((b: string) =>
              toast.success(`Unlocked: ${b}!`)
            )
          }
        }
      },
    }
  )

  // 4. Initialize The Engine
  const engine = usePracticeEngine({
    initialBeats,
    initialWords,
    frequency,
    difficulty,
    submitSession: saveSessionOptimistic,
    mode,
    cypherPlayers,
    isRecordingEnabled,
    shouldSaveSessions: Boolean(session?.user?.id),
  })

  // 5. Visual Effects & Glue Logic
  const isPro = isProUser(session?.user)

  // Polling Loop for UI (Timer/Siren) to avoid Audio Engine re-renders
  useEffect(() => {
    if (engine.status === 'PLAYING') {
      let rafId: number
      const loop = () => {
        const time = engine.getAudioTime()
        setUiTime(time)
        rafId = requestAnimationFrame(loop)
      }
      rafId = requestAnimationFrame(loop)
      return () => cancelAnimationFrame(rafId)
    } else {
      // When not playing, ensure we show the static time (e.g. 0 or pause time)
      setUiTime(engine.getAudioTime())
      return undefined
    }
  }, [engine.status, engine.beatPlayer])

  useEffect(() => {
    if (engine.status !== 'PLAYING') {
      didAutoStopRef.current = false
      return
    }

    const elapsed = Math.max(0, uiTime - (engine.startTime || 0))
    if (elapsed >= sessionDurationLimit && !didAutoStopRef.current) {
      didAutoStopRef.current = true
      engine.stopSession()
    }
  }, [
    engine.status,
    uiTime,
    engine.startTime,
    engine.stopSession,
    sessionDurationLimit,
  ])

  // Browser Navigation Guard (Refresh/Close prevention)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // status check: PLAYING, PAUSED, COUNTDOWN, RECORDING
      // Basically anything active.
      if (
        engine.status !== 'IDLE' &&
        engine.status !== 'COMPLETED' &&
        engine.status !== 'SAVING'
      ) {
        e.preventDefault()
        e.returnValue = '' // Required for Chrome
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [engine.status])

  // Countdown Logic (UI Side)
  const [countdownValue, setCountdownValue] = useState<number | 'GO' | null>(
    null
  )

  useEffect(() => {
    if (engine.status === 'COUNTDOWN') {
      let count = 3
      setCountdownValue(count)
      const interval = setInterval(() => {
        count--
        if (count > 0) {
          setCountdownValue(count)
          play('tick') // Assuming hook has this, or use standard beep
        } else if (count === 0) {
          setCountdownValue('GO')
          play('start') // Assuming hook has this
        } else {
          clearInterval(interval)
          setCountdownValue(null)
          engine.completeCountdown()
        }
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCountdownValue(null)
      return undefined
    }
  }, [engine.status, engine.completeCountdown, play])

  // Siren Logic
  const isSirenActive = useMemo(() => {
    if (engine.status !== 'PLAYING') return false
    if (!engine.wordTiming.duration) return false

    // Siren triggers when < 40% of time remains (or < 4s), mimicking old logic roughly
    // Old logic: min(4, wordDuration * 0.6) was the threshold.
    // Let's use simpler: last 30% of the bar.
    const elapsed = uiTime - engine.wordTiming.start
    const remaining = engine.wordTiming.duration - elapsed
    const threshold = Math.min(4, engine.wordTiming.duration * 0.4)

    return remaining > 0 && remaining <= threshold
  }, [engine.status, engine.wordTiming, uiTime])

  // Siren Phase (Fast toggle for visuals)
  const [sirenPhase, setSirenPhase] = useState(0)
  useEffect(() => {
    if (isSirenActive) {
      const interval = setInterval(() => setSirenPhase((p) => (p + 1) % 2), 150)
      return () => clearInterval(interval)
    }
    return undefined
  }, [isSirenActive])

  // Beat Handling
  // Automatically load selected beat when it changes in context
  useEffect(() => {
    if (selectedBeat && engine.status === 'IDLE') {
      engine.beatPlayer
        .loadBeat({
          ...selectedBeat,
          storageUrl: selectedBeat.storageUrl,
          isPremium: selectedBeat.isPremium ?? false,
          artistName: selectedBeat.artistName || 'Unknown',
          duration: selectedBeat.duration || 0,
        })
        .catch(() => toast.error('Failed to load beat'))
    }
  }, [selectedBeat?.id, engine.status]) // Only re-run if ID changes

  // Navigation handlers
  const handleBack = () => router.back()
  const handleBeatSelect = (beat: Beat) => {
    if (engine.status === 'PLAYING' || engine.status === 'PAUSED') {
      if (confirm('Stop current session to change beat?')) {
        engine.stopSession()
        setBeat(beat)
      }
    } else {
      setBeat(beat)
    }
  }

  // Loading Animation
  const [loadingText, setLoadingText] = useState('Initializing Studio...')
  useEffect(() => {
    const texts = [
      'Initializing Studio...',
      'Syncing Audio...',
      'Ready to Record',
    ]
    let i = 0
    const interval = setInterval(() => setLoadingText(texts[++i % 3]), 2000)
    return () => clearInterval(interval)
  }, [])

  if (!isLoaded) return null // Or skeleton

  return (
    <ScreenPage
      header={
        <AppHeader
          showBackButton
          onBack={handleBack}
          customTitle="THE BOOTH"
          customSubtitle="Step up and drop your bars"
        />
      }
      className="bg-background h-full min-h-full overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent-purple/20 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent-blue/10 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center h-full px-4 pb-16 md:pb-8 max-w-lg mx-auto w-full overflow-hidden">
        {/* Siren Overlay */}
        <AnimatePresence>
          {isSirenActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none rounded-3xl z-0"
              style={{
                background:
                  sirenPhase === 0
                    ? 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
              }}
            />
          )}
        </AnimatePresence>

        <div className="w-full flex-1 z-20 flex flex-col min-h-0">
          {selectedBeat ? (
            <PracticeControls
              // Data
              selectedBeat={selectedBeat}
              beats={beats}
              currentWord={engine.currentWord}
              wordTiming={engine.wordTiming}
              // Status
              isPlaying={
                engine.status === 'PLAYING' || engine.status === 'COUNTDOWN'
              }
              isPaused={engine.status === 'PAUSED'}
              isRecording={engine.recorder.isRecording}
              isLoading={
                engine.beatPlayer.isLoading ||
                engine.status === 'MIXING' ||
                engine.status === 'SAVING'
              }
              loadingText={
                engine.status === 'MIXING'
                  ? 'Mixing Audio...'
                  : engine.status === 'SAVING'
                    ? 'Saving Session...'
                    : 'Preparing Studio'
              }
              isSirenActive={isSirenActive}
              sirenPhase={sirenPhase}
              countdownValue={countdownValue}
              error={engine.error || engine.beatPlayer.error}
              // Time
              currentTime={uiTime}
              startTime={engine.startTime}
              sessionDuration={sessionDurationLimit}
              recordingDuration={engine.recorder.duration}
              // Settings
              difficulty={difficulty}
              activeDifficulty={engine.activeDifficulty}
              frequency={frequency}
              mode={mode}
              isPro={isPro}
              isRecordingEnabled={isRecordingEnabled}
              // Handlers
              handleToggle={() => {
                if (engine.status === 'IDLE' || engine.status === 'COMPLETED') {
                  engine.startSession()
                } else {
                  // Stop/Pause logic managed via modal usually
                  setPendingAction('finish')
                  setShowExitConfirmation(true)
                }
              }}
              // Beat Handling
              activePlayer={engine.activePlayer}
              cypherPlayers={cypherPlayers}
              handleRestart={() => {
                setPendingAction('restart')
                setShowExitConfirmation(true)
              }}
              handleBeatSelect={handleBeatSelect}
              handleDifficultyChange={setDifficulty}
              handleFrequencyChange={setFrequency}
              onTogglePause={engine.togglePause}
              handleUpgrade={() => {
                setPremiumTrigger('recording')
                setShowPremiumModal(true)
              }}
              onToggleRecordingMode={() =>
                setIsRecordingEnabled(!isRecordingEnabled)
              }
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="h-16 w-16 rounded-full border-2 border-accent-purple/20 border-t-accent-purple animate-spin" />
              <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest animate-pulse">
                {loadingText}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SessionSummaryModal
        data={sessionSummary}
        onClose={() => {
          const meta = sessionSummary?.meta
          if (meta && meta.totalSessions >= 3 && !meta.hasRated) {
            setSessionSummary(null)
            setShowRateModal(true)
          } else {
            setSessionSummary(null)
            router.push('/recordings')
          }
        }}
      />
      <RateAppModal
        isOpen={showRateModal}
        onClose={() => {
          setShowRateModal(false)
          router.push('/recordings')
        }}
        onRate={() => {
          setShowRateModal(false)
          router.push('/feedback?mode=rate')
        }}
      />
      <GuestLoginModal
        isOpen={showGuestModal}
        onClose={() => {
          setShowGuestModal(false)
          router.push('/')
        }}
      />
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        trigger={premiumTrigger}
        beatCount={beats.length}
      />

      <Modal
        isOpen={showExitConfirmation}
        onClose={() => setShowExitConfirmation(false)}
        title="End Session?"
        showCloseButton={false}
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            {pendingAction === 'restart'
              ? 'Restarting will discard the current recording. Continue?'
              : 'Stop and save your session?'}
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowExitConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowExitConfirmation(false)
                if (pendingAction === 'restart') {
                  engine.discardSession()
                  setTimeout(() => engine.startSession(), 500)
                } else {
                  engine.stopSession() // This triggers 'FINISHING' -> 'SAVING'
                }
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </ScreenPage>
  )
}

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

import { useBeatPlayer } from '@/hooks/useBeatPlayer'
import { useRecording } from '@/hooks/useRecording'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useForceUpdate } from '@/hooks/useForceUpdate'
import { useWakeLock } from '@/hooks/useWakeLock'
import { useSound } from '@/hooks/useSound'
import { useOptimisticAction } from '@/hooks/useOptimisticAction'
import { usePracticeSession } from '@/contexts/SessionContext'
import { GuestStorage } from '@/lib/guest-storage'

import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { GuestLoginModal } from '@/components/auth/GuestLoginModal'
import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'
import SessionSummaryModal from '@/components/molecules/practice/SessionSummaryModal'

import PracticeControls from '@/components/organisms/practice/PracticeControls'
import { AudioVisualizer } from '@/components/molecules/visuals/AudioVisualizer'

interface SessionSummary {
  score: number
  vibe: string
  description: string
  wordCount: number
  duration: number
  audioUrl: string
  newBadges: string[]
  difficulty: string
  bpm: number
  frequency: number
  isOptimistic: boolean
}

import { Beat } from '@/types/database'
import { SESSION_CONFIG } from '@/lib/constants/design'
import { ErrorCodes } from '@/lib/errors'

export default function PracticePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isInfiniteMode] = useState(false)

  // Audio Feedback
  const { play } = useSound()

  // Accessibility

  // Session State
  const {
    selectedBeat,
    setBeat,
    frequency,
    difficulty,
    setFrequency,
    setDifficulty,
    isTTSEnabled,
    ttsVolume,
    isLoaded,
    wordCategory,
  } = usePracticeSession()

  // Local State
  const [currentWord, setCurrentWord] = useState<string>('')
  const [wordList, setWordList] = useState<string[]>([])
  const [wordIndex, setWordIndex] = useState(0)
  const [sessionDuration] = useState(SESSION_CONFIG.DEFAULT_DURATION_SECONDS)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Modals
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [premiumTrigger, setPremiumTrigger] = useState<
    'recording' | 'beat' | 'history'
  >('beat')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(
    null
  )

  // Derived state
  const usedWords = wordList.slice(0, wordIndex + 1)
  const isPro =
    session?.user?.subscriptionStatus === 'active' ||
    session?.user?.subscriptionStatus === 'trialing'

  // Hooks
  const { error, handleError, clearError } = useErrorHandler()
  const forceUpdate = useForceUpdate()
  const { requestLock, releaseLock } = useWakeLock()
  const beatPlayer = useBeatPlayer()

  // Beats Loading State
  const [beats, setBeats] = useState<Beat[]>([]) // Local state for dropdown

  // Fetch Beats Effect
  useEffect(() => {
    async function fetchBeats() {
      try {
        const response = await fetch('/api/beats')
        const data = await response.json()
        setBeats(data.beats || [])
      } catch (err) {
        console.error('Failed to fetch beats', err)
      }
    }
    fetchBeats()
  }, [])

  // Playback Control (Detached from hook to resolve circular deps)
  const stopPlayback = useCallback(() => {
    beatPlayer.stop()
    releaseLock()
    setCurrentWord(wordList[0] || '')
    forceUpdate() // Ensure UI updates
  }, [beatPlayer, wordList, forceUpdate, releaseLock])

  // Optimistic Action Hook
  const { mutate: saveSessionOptimistic } = useOptimisticAction(
    async (formData: FormData) => {
      const response = await fetch('/api/recordings', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok)
        throw new Error(data.error || 'Failed to save recording')
      return data
    },
    {
      onOptimistic: (formData: FormData) => {
        // 1. Immediate Feedback: Play Success Sound
        play('success')

        // 2. Predict Session Summary
        // Parse basic values back from FormData for immediate display
        const difficulty = formData.get('difficulty') as string
        const frequency = parseFloat(formData.get('frequency') as string)
        const duration = parseFloat(formData.get('durationSeconds') as string)
        const wordCount = JSON.parse(formData.get('wordsUsed') as string).length
        const beatBpm = selectedBeat?.bpm || 0

        // Optimistic Score Calculation (Simple Client-Side Estimate)
        // This visual feedback is instant; server validation happens in background.
        const predictedScore = Math.round(duration * 10 * (1 + wordCount / 10))

        setSessionSummary({
          score: predictedScore,
          vibe: 'Freestyle Flow',
          description: 'Nice session!',
          wordCount: wordCount,
          duration: duration,
          audioUrl: URL.createObjectURL(formData.get('audio') as Blob), // Instant playback
          newBadges: [], // Can't predict without server logic, leave empty
          difficulty: difficulty,
          bpm: beatBpm,
          frequency: frequency,
          isOptimistic: true, // UI can show a spinner for specific fields if needed
        })
      },
      onSuccess: (data) => {
        // 3. Reconcile with Server Data
        if (data.session) {
          setSessionSummary((prev: SessionSummary | null) => ({
            ...prev!,
            score: data.session.score, // Correct score from server
            newBadges: data.session.newBadges,
            isOptimistic: false,
          }))

          // Toast Badges
          if (data.session.newBadges && Array.isArray(data.session.newBadges)) {
            data.session.newBadges.forEach((badge: string) => {
              toast.success(`Achievement Unlocked: ${badge}!`, { icon: '🏆' })
            })
          }
        }
      },
      onError: (err) => {
        handleError(err, ErrorCodes.SESSION_SAVE_FAILED)
        setSessionSummary(null) // Revert UI on failure
      },
    }
  )

  // Recording Complete Handler
  const handleRecordingComplete = useCallback(
    async (blob: Blob, recordedDuration: number) => {
      // Infinite Mode Check
      if (isInfiniteMode) {
        toast('Session Completed (Practice Mode)', {
          icon: '♾️',
          style: {
            background: 'linear-gradient(to right, #6b21a8, #c026d3)',
            color: '#fff',
          },
        })
        return
      }

      if (blob.size < 1000) {
        console.warn('Recording too small', blob.size)
        // toast.error('No audio detected.', { icon: '🎤' }) // Reduced noise for "silent" tests
        return
      }

      if (recordedDuration < 2) {
        toast.error('Recording too short.', { icon: 'too-short' })
        return
      }

      if (selectedBeat) {
        if (session?.user) {
          try {
            const measuredDuration = Math.round(recordedDuration)
            const fallbackDuration =
              blob.size > 0 ? Math.max(1, Math.round(blob.size / 16000)) : 1
            const actualDuration = Math.max(
              1,
              measuredDuration > 0 ? measuredDuration : fallbackDuration
            )

            const vibe = 'Freestyle Flow'
            const finalScore = 0 // Server calculates real score

            const formData = new FormData()
            formData.append('audio', blob, 'recording.webm')
            formData.append('beatId', selectedBeat.id)
            formData.append(
              'title',
              `${selectedBeat.title} - ${new Date().toLocaleDateString()}`
            )
            formData.append('durationSeconds', actualDuration.toString())
            formData.append('frequency', frequency.toString())
            formData.append('difficulty', difficulty.toString())
            formData.append('score', finalScore.toString())
            formData.append('vibe', vibe)
            formData.append('wordsUsed', JSON.stringify(usedWords))

            // EXECUTE OPTIMISTIC SAVE
            await saveSessionOptimistic(formData)
          } catch (err) {
            handleError(err, ErrorCodes.SESSION_SAVE_FAILED)
          }
        } else {
          // Guest Mode (unchanged)
          try {
            const actualDuration = Math.max(1, Math.round(recordedDuration))
            const metadata = {
              beatId: selectedBeat.id,
              beatTitle: selectedBeat.title,
              frequency: frequency,
              difficulty: difficulty,
              duration: actualDuration,
              createdAt: Date.now(),
            }
            await GuestStorage.saveSession(blob, metadata)
            setShowGuestModal(true)
          } catch (err) {
            console.error('Guest save failed', err)
            setSaveMessage('Could not save temp recording. Please sign in.')
          }
        }
      }
    },
    [
      selectedBeat,
      session?.user,
      frequency,
      difficulty,
      handleError,
      usedWords,
      isInfiniteMode,
      saveSessionOptimistic, // Added dep
    ]
  )

  // Recording Hook
  const {
    isRecording,
    duration,
    start: startRecording,
    stop: stopRecording,
    resume: resumeRecording,
  } = useRecording({
    maxDuration: isPro ? null : 120,
    onComplete: handleRecordingComplete,
    onMaxDurationReached: () => {
      stopPlayback()
      if (!isPro) {
        setPremiumTrigger('recording')
        setShowPremiumModal(true)
      }
    },
  })

  // Handlers

  const handleStop = useCallback(() => {
    play('stop')
    stopRecording()
    stopPlayback()
  }, [play, stopRecording, stopPlayback])

  // Initialization Effect
  useEffect(() => {
    const initSession = async () => {
      try {
        const [wordsRes] = await Promise.all([
          fetch(
            `/api/words/random?difficulty=${difficulty}&count=100&category=${wordCategory || ''}`
          ),
        ])
        const [wordsData] = await Promise.all([wordsRes.json()])

        if (wordsData.words) {
          const words = wordsData.words.map(
            (w: { wordText: string }) => w.wordText
          )
          setWordList(words)
          if (!currentWord && words.length > 0) setCurrentWord(words[0])
        }
      } catch (err) {
        console.error('Init error', err)
        handleError(err, ErrorCodes.BEAT_LOAD_FAILED)
      }
    }
    initSession()
    // TTS Warmup
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance('')
      u.volume = 0
      window.speechSynthesis.speak(u)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // TTS Voice
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  useEffect(() => {
    const getBestVoice = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return null
      const voices = window.speechSynthesis.getVoices()
      return (
        voices.find((v) => v.name === 'Google US English') ||
        voices.find((v) => v.name === 'Samantha') ||
        voices.find((v) => v.lang.startsWith('en-US')) ||
        voices[0] ||
        null
      )
    }
    const setBest = () => {
      const v = getBestVoice()
      if (v) setVoice(v)
    }
    setBest()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = setBest
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis)
        window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const speak = useCallback(
    (text: string, force = false) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return
      if (!isTTSEnabled && !force) return
      try {
        const u = new SpeechSynthesisUtterance(text)
        u.rate = 1.1
        u.volume = ttsVolume
        if (voice) u.voice = voice
        window.speechSynthesis.speak(u)
      } catch (err) {
        console.error('TTS Error', err)
      }
    },
    [isTTSEnabled, ttsVolume, voice]
  )

  const [_countdownValue, setCountdownValue] = useState<number | 'GO' | null>(
    null
  )

  const startCountdown = useCallback(async () => {
    if (!selectedBeat) return
    const msPerBeat = (60 / selectedBeat.bpm) * 1000
    const offsetMs = (selectedBeat.offset || 0) * 1000
    const totalCountdownMs = 4 * msPerBeat // 3, 2, 1, GO

    // Calculate when to start/seek audio so drop hits at "GO"
    // Time to Start Audio = (Start of Countdown) + (Total Countdown Duration) - (Time to Drop in Audio)
    // If positive: We wait that long, then play from 0.
    // If negative: We seek into the audio and play immediately.
    const timeToStartAudio = totalCountdownMs - offsetMs

    const playBeep = (freq: number, type: OscillatorType) => {
      // Inline beep logic or reuse hook if complex. useSound is for UI sounds, this is rhythmic.
      const AudioContext =
        window.AudioContext ||
        (
          window as unknown as {
            webkitAudioContext: typeof window.AudioContext
          }
        ).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
    }

    // Schedule Audio Start
    let audioStartTimer: NodeJS.Timeout | null = null

    // We need to ensure we don't start recording until "GO" usually,
    // but if we seek deep into audio, we might want to start?
    // No, "Practice" starts at "GO". Audio helps you prep.

    const triggerAudio = async () => {
      try {
        if (timeToStartAudio < 0) {
          // Offset is larger than countdown (long intro)
          // Seek to where we need to be
          const seekTime = Math.abs(timeToStartAudio) / 1000
          beatPlayer.seek(seekTime)
          await beatPlayer.play()
        } else {
          // Offset is small (short intro), play from 0
          await beatPlayer.play()
        }
      } catch (err) {
        handleError(err, ErrorCodes.AUDIO_PLAYBACK_FAILED)
      }
    }

    if (timeToStartAudio > 0) {
      audioStartTimer = setTimeout(triggerAudio, timeToStartAudio)
    } else {
      triggerAudio()
    }

    // Run Countdown Visuals
    const sequence = [3, 2, 1, 'GO']
    for (const val of sequence) {
      setCountdownValue(val as number | 'GO' | null)
      if (val === 'GO') playBeep(880, 'square')
      else playBeep(440, 'sine')
      await new Promise((r) => setTimeout(r, msPerBeat))
    }

    // THE DROP (GO) logic
    clearError()
    if (wordList.length > 0 && !currentWord) setCurrentWord(wordList[0])

    // Start Recorder
    try {
      if (!isRecording) {
        await requestLock()
        if (isPro) startRecording(true).catch(console.error)
      } else {
        resumeRecording()
      }
    } catch (err) {
      console.error('Recording start failed', err)
    }

    setTimeout(() => setCountdownValue(null), 1000)

    return () => {
      if (audioStartTimer) clearTimeout(audioStartTimer)
    }
  }, [
    selectedBeat,
    beatPlayer,
    wordList,
    currentWord,
    isRecording,
    requestLock,
    startRecording,
    isPro,
    resumeRecording,
    handleError,
    clearError,
  ])

  const handlePlayPause = useCallback(async () => {
    play('start')
    if (!selectedBeat) return

    if (beatPlayer.isPlaying) {
      if (isRecording) {
        handleStop()
      } else {
        beatPlayer.pause()
        if (isRecording) {
          // pause recording logic via hook if needed, but current flow stops explicit recording
          // If we just pause beat, recorder keeps going usually.
          // But here we want full stop/pause parity.
        }
      }
    } else {
      // Check mic permission or audio context state
      if (beatPlayer.currentTime > 0) {
        // Resume
        await beatPlayer.play()
        if (isRecording) {
          // resume recorder
        }
      } else {
        startCountdown()
      }
    }
  }, [play, selectedBeat, beatPlayer, isRecording, handleStop, startCountdown])

  // Sync Logic
  const sessionStateRef = useRef({ lastWordIndex: -1, isActive: false })
  const paramsRef = useRef({
    frequency,
    wordList,
    selectedBeat,
    sessionDuration,
    isTTSEnabled,
  })

  useEffect(() => {
    paramsRef.current = {
      frequency,
      wordList,
      selectedBeat,
      sessionDuration,
      isTTSEnabled,
    }
  }, [frequency, wordList, selectedBeat, sessionDuration, isTTSEnabled])

  useEffect(() => {
    if (!beatPlayer.isPlaying) {
      sessionStateRef.current.isActive = false
      return
    }
    const state = sessionStateRef.current

    // Only reset state if we are just starting (isActive was false)
    if (!state.isActive) {
      state.isActive = true
      // Only reset index if we are at the very beginning
      if (beatPlayer.currentTime < 0.5) {
        state.lastWordIndex = -1
      }
    }

    const updateLoop = () => {
      if (!state.isActive) return
      const params = paramsRef.current
      if (!params.selectedBeat || params.wordList.length === 0) return

      const elapsed = beatPlayer.getPreciseTime()

      // Stop condition
      if (
        elapsed >=
        params.sessionDuration + (params.selectedBeat.offset || 0)
      ) {
        if (
          elapsed - (params.selectedBeat.offset || 0) >=
          params.sessionDuration
        ) {
          handleStop()
          return
        }
      }

      const sessionTime = Math.max(
        0,
        elapsed - (params.selectedBeat.offset || 0)
      )

      const secondsPerBar = (60 / params.selectedBeat.bpm) * 4
      const secondsPerPrompt = secondsPerBar * params.frequency
      const wordIdx = Math.floor(sessionTime / secondsPerPrompt)
      const actualIndex = wordIdx % params.wordList.length

      if (wordIdx !== state.lastWordIndex) {
        state.lastWordIndex = wordIdx
        const newWord = params.wordList[actualIndex]
        if (newWord) {
          setCurrentWord(newWord)
          setWordIndex(wordIdx)
          if (params.isTTSEnabled) speak(newWord)
        }
      }
      forceUpdate()
      requestAnimationFrame(updateLoop)
    }
    const frameId = requestAnimationFrame(updateLoop)
    return () => {
      // logic to clean up text loop validation
      cancelAnimationFrame(frameId)
    }
  }, [beatPlayer.isPlaying, handleStop, beatPlayer, speak, forceUpdate]) // Added deps to satisfy lint

  // Shortcuts & Events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return
      if (e.code === 'Space') {
        e.preventDefault()
        handlePlayPause()
      }
      if (e.code === 'KeyR' && !isRecording && beatPlayer.isPlaying)
        startRecording(!isPro)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    handlePlayPause,
    isRecording,
    beatPlayer.isPlaying,
    startRecording,
    isPro,
  ])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && beatPlayer.isPlaying) handlePlayPause()
    }
    window.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      window.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [beatPlayer.isPlaying, handlePlayPause])

  useEffect(() => {
    if (isLoaded && !selectedBeat) router.push('/difficultyselection')
  }, [isLoaded, selectedBeat, router])

  useEffect(() => {
    if (selectedBeat) {
      beatPlayer.loadBeat({
        ...selectedBeat,
        storageUrl: selectedBeat.storageUrl,
        isPremium: selectedBeat.isPremium ?? false,
        artistName: selectedBeat.artistName ?? 'Unknown Artist',
        duration: selectedBeat.duration ?? 0,
      })
    }
  }, [selectedBeat, beatPlayer])

  // Bento Grid Render
  return (
    <OnboardingLayout
      showBackButton={true}
      showHeader={true}
      showSettings={true}
      showProgress={true}
      onBack={() => router.push('/difficultyselection')}
    >
      <div className="min-h-screen pt-20 pb-8 px-4 md:px-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-center items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            {selectedBeat ? selectedBeat.title : 'Practice Session'}
          </h1>
        </div>

        {/* Classic Centralized Layout */}
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center">
          {/* Side Visualizers */}
          <div className="absolute inset-y-0 left-0 w-1/4 md:w-1/6 hidden md:block opacity-50 pointer-events-none">
            <AudioVisualizer
              isPlaying={beatPlayer.isPlaying || isRecording}
              color="#A855F7"
              className="w-full h-full"
            />
          </div>
          <div className="absolute inset-y-0 right-0 w-1/4 md:w-1/6 hidden md:block opacity-50 pointer-events-none rotate-180">
            <AudioVisualizer
              isPlaying={beatPlayer.isPlaying || isRecording}
              color="#A855F7"
              className="w-full h-full"
            />
          </div>

          {/* Central Player */}
          <div className="z-10 w-full max-w-md mx-auto">
            {selectedBeat ? (
              <PracticeControls
                selectedBeat={selectedBeat}
                beats={beats}
                onBeatSelect={setBeat}
                isPlaying={beatPlayer.isPlaying}
                isLoading={!isLoaded && !selectedBeat}
                currentTime={beatPlayer.currentTime}
                sessionDuration={sessionDuration}
                currentWord={currentWord}
                countdownValue={_countdownValue}
                onToggle={handlePlayPause}
                onRestart={() => {
                  play('click')
                  // logic to restart
                  handlePlayPause()
                }}
                difficulty={difficulty}
                frequency={frequency}
                isRecording={isRecording}
                recordingDuration={duration} // from useRecording hook
                isPro={isPro}
                isAuthenticated={!!session?.user || true} // Allow all users to start practice (guests can practice, just not save)
                onUpgrade={() => {
                  setPremiumTrigger('recording')
                  setShowPremiumModal(true)
                }}
                onDifficultyChange={setDifficulty}
                onFrequencyChange={setFrequency}
                error={error ? error.message : undefined}
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 rounded-full border-2 border-accent-purple/20 border-t-accent-purple animate-spin" />
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                  Loading Beat...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Global Overlays & Modals */}
        <AnimatePresence>
          {sessionSummary && (
            <SessionSummaryModal
              data={sessionSummary}
              onClose={() => setSessionSummary(null)}
            />
          )}

          {showPremiumModal && (
            <PremiumModal
              isOpen={showPremiumModal}
              onClose={() => setShowPremiumModal(false)}
              trigger={premiumTrigger}
            />
          )}

          {/* Saving Indicator */}
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-500/20 border border-green-500 text-green-400 rounded-full backdrop-blur-md"
            >
              {saveMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Errors */}
        {error && <ErrorAlert error={error} onDismiss={clearError} />}

        {/* Guest Modal */}
        {showGuestModal && (
          <GuestLoginModal
            isOpen={showGuestModal}
            onClose={() => setShowGuestModal(false)}
          />
        )}
      </div>
    </OnboardingLayout>
  )
}

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
import { GuestLoginModal } from '@/components/molecules/auth/GuestLoginModal'
import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'
import SessionSummaryModal from '@/components/molecules/practice/SessionSummaryModal'

import PracticeControls from '@/components/organisms/practice/PracticeControls'
import { AudioVisualizer } from '@/components/molecules/visuals/AudioVisualizer'
import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/atoms/Modal'
import { FlowComboOverlay } from '@/components/molecules/gamification/FlowComboOverlay'

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
    isRecordingEnabled,
    mode,
    cypherPlayers,
  } = usePracticeSession()

  // Local State
  const [currentWord, setCurrentWord] = useState<string>('')
  const [wordList, setWordList] = useState<string[]>([])
  const [wordIndex, setWordIndex] = useState(0)
  const [sessionDuration] = useState(SESSION_CONFIG.DEFAULT_DURATION_SECONDS)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [combo, setCombo] = useState(0)

  // Modals
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
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
  const [loadingText, setLoadingText] = useState(
    'Building Studio Environment...'
  )

  // Fetch Beats Effect
  useEffect(() => {
    const texts = [
      'Building Studio Environment...',
      'Syncing AI Word Bank...',
      'Dropping the Beat...',
    ]
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % texts.length
      setLoadingText(texts[i])
    }, 2000)
    return () => clearInterval(interval)
  }, [])

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
  const sessionTimeRef = useRef(0)
  const [monotonicTime, setMonotonicTime] = useState(0)
  const [isSirenActive, setIsSirenActive] = useState(false)
  const [sirenPhase, setSirenPhase] = useState(0) // 0 or 1 for red/blue

  const stopPlayback = useCallback(() => {
    beatPlayer.stop()
    releaseLock()
    sessionTimeRef.current = 0
    setMonotonicTime(0)
    setCurrentWord('')
    forceUpdate() // Ensure UI updates
  }, [beatPlayer, forceUpdate, releaseLock])

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

        // Optimistic Score - REMOVED as per user request
        // const predictedScore = Math.round(duration * 10 * (1 + wordCount / 10))

        setSessionSummary({
          score: 0, // Removed
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
          setSessionSummary((prev: SessionSummary | null) => {
            if (!prev) return null // Guard against closed modal
            return {
              ...prev,
              score: data.session.score, // Correct score from server
              newBadges: data.session.newBadges,
              xp: data.session.xp, // Crucial: Update XP data from server
              isOptimistic: false,
            }
          })

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
        // Note: We don't null out sessionSummary here as per user UX flow,
        // but we ensure the "recording" state is dead so navigation works.
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
      handleStop()
      if (!isPro) {
        setPremiumTrigger('recording')
        setShowPremiumModal(true)
      }
    },
  })

  // Handlers

  const handleStop = useCallback(() => {
    play('stop')
    stopPlayback()
    stopRecording() // This will trigger handleRecordingComplete
  }, [play, stopRecording, stopPlayback])

  const handleBackNavigation = useCallback(() => {
    if (isRecording || beatPlayer.isPlaying) {
      // Pause playback while deciding
      if (beatPlayer.isPlaying) beatPlayer.pause()
      setShowExitConfirmation(true)
    } else {
      router.push('/difficultyselection')
    }
  }, [isRecording, beatPlayer, router])

  const confirmExit = useCallback(() => {
    handleStop()
    // Explicitly cancel TTS to prevent it from continuing on the next page
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setShowExitConfirmation(false)
    router.push('/difficultyselection')
  }, [handleStop, router])

  // Warn on browser refresh/close if recording
  useEffect(() => {
    if (!isRecording) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isRecording])

  // Initialization Effect
  useEffect(() => {
    const initSession = async () => {
      try {
        const wordsRes = await fetch(
          `/api/words/random?difficulty=${difficulty}&count=100&category=${wordCategory || ''}`
        )

        if (
          !wordsRes.ok ||
          !wordsRes.headers.get('content-type')?.includes('application/json')
        ) {
          throw new Error('Failed to load words or invalid response')
        }

        const wordsData = await wordsRes.json()

        if (wordsData.words) {
          let words = wordsData.words.map(
            (w: { wordText: string }) => w.wordText
          )
          // Shuffle initially to be sure
          words = words.sort(() => Math.random() - 0.5)
          setWordList(words)
          // Don't show word initially - wait for GO
          setCurrentWord('')
        }
      } catch (err) {
        console.error('Init error:', err)
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
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
        // Cleanup TTS on unmount to prevent double speech on re-entry
        window.speechSynthesis.cancel()
      }
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

    // Shuffle words for a fresh start every time we begin
    setWordList((prev) => [...prev].sort(() => Math.random() - 0.5))

    // Final check for loading errors
    if (beatPlayer.error) {
      toast.error(`Cannot start: ${beatPlayer.error}`)
      return
    }

    const msPerBeat = (60 / selectedBeat.bpm) * 1000
    const offsetMs = (selectedBeat.offset || 0) * 1000

    const playBeep = (freq: number, type: OscillatorType) => {
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

    const sequence = [3, 2, 1, 'GO']
    for (const val of sequence) {
      setCountdownValue(val as number | 'GO' | null)
      if (val === 'GO') playBeep(880, 'square')
      else playBeep(440, 'sine')
      await new Promise((r) => setTimeout(r, msPerBeat))
    }

    // THE DROP (GO) logic
    try {
      // Unmute and seek to start
      const seekTime = offsetMs < 0 ? Math.abs(offsetMs) / 1000 : 0
      beatPlayer.setVolume(1)
      beatPlayer.seek(seekTime)

      // Single authoritative play call
      beatPlayer.setLoop(true) // Ensure track loops seamlessly
      await beatPlayer.play()
    } catch (e) {
      handleError(e, ErrorCodes.AUDIO_PLAYBACK_FAILED)
    }

    // THE DROP (GO) logic
    clearError()

    // Start Recorder
    try {
      if (isRecordingEnabled) {
        if (!isRecording) {
          await requestLock()
          if (isPro) startRecording(true).catch(console.error)
        } else {
          resumeRecording()
        }
      }
    } catch (err) {
      console.error('Recording start failed', err)
    }

    setTimeout(() => setCountdownValue(null), 1000)

    return () => {
      // No timer to clear
    }
  }, [
    selectedBeat,
    beatPlayer,
    isRecording,
    isRecordingEnabled,
    requestLock,
    startRecording,
    isPro,
    resumeRecording,
    handleError,
    clearError,
  ])

  const handlePlayPause = useCallback(async () => {
    if (!selectedBeat) return

    if (beatPlayer.isPlaying) {
      play('stop')
      if (isRecording) {
        handleStop()
      } else {
        beatPlayer.pause()
      }
    } else {
      // PRIME AUDIO: This is the critical fix for mobile/browser autoplay restrictions.
      // We call prime() immediately on the user gesture (click).
      if (beatPlayer.currentTime === 0) {
        await beatPlayer.prime()
      }

      play('start')

      // Check mic permission or audio context state
      if (beatPlayer.currentTime > 0) {
        // Resume
        await beatPlayer.play()
      } else {
        startCountdown()
      }
    }
  }, [play, selectedBeat, beatPlayer, isRecording, handleStop, startCountdown])

  const handleBeatSelection = useCallback(
    (beat: Beat) => {
      if (isRecording) {
        if (
          confirm(
            'Recording in progress. Do you want to stop this session and change tracks?'
          )
        ) {
          handleStop()
          setBeat(beat)
        }
      } else {
        setBeat(beat)
      }
    },
    [isRecording, handleStop, setBeat]
  )

  // Sync Logic
  const sessionStateRef = useRef({
    lastWordIndex: -1,
    isActive: false,
    nextWordChangeTime: 0, // New accumulator tracker
  })
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
        sessionTimeRef.current = 0
        state.nextWordChangeTime = 0 // Force immediate first word
      }
    }

    let lastFrameTime = performance.now()
    const updateLoop = () => {
      const now = performance.now()
      const delta = (now - lastFrameTime) / 1000
      lastFrameTime = now

      if (!state.isActive) return
      const params = paramsRef.current
      if (!params.selectedBeat || params.wordList.length === 0) return

      // Increment monotonic session time
      sessionTimeRef.current += delta
      const sessionTime = sessionTimeRef.current
      setMonotonicTime(sessionTime)

      // GRACE PERIOD: Ignore stop conditions for the first 1.5 seconds
      if (sessionTime > 1.5) {
        if (sessionTime >= params.sessionDuration) {
          handleStop()
          return
        }
      }

      // Timing Logic
      const secondsPerBar = (60 / params.selectedBeat.bpm) * 4

      // Word Change Logic
      if (sessionTime >= state.nextWordChangeTime) {
        // Trigger Word Change
        // Calculate the NEXT target based on CURRENT settings
        state.nextWordChangeTime += secondsPerBar * params.frequency

        // Ensure we don't get stuck in the past if lag happens (catch up)
        if (state.nextWordChangeTime < sessionTime) {
          state.nextWordChangeTime =
            sessionTime + secondsPerBar * params.frequency
        }

        // Update Index
        const newIndex = state.lastWordIndex + 1
        state.lastWordIndex = newIndex

        const actualIndex = newIndex % params.wordList.length
        const newWord = params.wordList[actualIndex]

        if (newWord) {
          setCurrentWord(newWord)
          setWordIndex(newIndex) // This drives the UI shake effect via key
          if (params.isTTSEnabled) speak(newWord)
        }
      }

      // Siren Logic: 4 seconds before the NEXT change
      const timeUntilNext = state.nextWordChangeTime - sessionTime
      const sirenActive = timeUntilNext <= 4 && timeUntilNext > 0

      setIsSirenActive(sirenActive)

      // sirenPhase toggles every 150ms during siren
      if (sirenActive) {
        setSirenPhase(Math.floor(sessionTime / 0.15) % 2)
      }

      forceUpdate()
      requestAnimationFrame(updateLoop)
    }
    const frameId = requestAnimationFrame(updateLoop)
    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [beatPlayer.isPlaying, handleStop, beatPlayer, speak, forceUpdate])

  // Watch for audio errors
  useEffect(() => {
    if (beatPlayer.error) {
      toast.error(`Audio Error: ${beatPlayer.error}`)
      handleStop()
    }
  }, [beatPlayer.error, handleStop])

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

      // Mock Combo Trigger for Testing
      if (e.code === 'KeyC') {
        setCombo((p) => p + 1)
        play('click')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    handlePlayPause,
    isRecording,
    beatPlayer.isPlaying,
    startRecording,
    isPro,
    play,
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
      // Ensure clean slate
      beatPlayer.stop()

      beatPlayer
        .loadBeat({
          ...selectedBeat,
          storageUrl: selectedBeat.storageUrl,
          isPremium: selectedBeat.isPremium ?? false,
          artistName: selectedBeat.artistName ?? 'Unknown Artist',
          duration: selectedBeat.duration ?? 0,
        })
        .catch((err) => {
          console.error('[Practice] Failed to load beat:', err)
          toast.error('Failed to load beat. The audio file may be missing.')
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBeat?.id]) // ONLY reload when the beat ID changes

  // Calculate Active Player for Cypher Mode
  const beatsElapsed = (monotonicTime * (selectedBeat?.bpm || 0)) / 60
  const barsElapsed = beatsElapsed / 4
  const safeFrequency = frequency > 0 ? frequency : 8
  const currentTurn = Math.floor(barsElapsed / safeFrequency)
  const activePlayer = (currentTurn % (cypherPlayers || 1)) + 1

  // Bento Grid Render
  return (
    <OnboardingLayout
      showBackButton={true}
      showHeader={true}
      showSettings={true}
      showProgress={true}
      onBack={handleBackNavigation}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'FreeStyla Practice Studio',
            operatingSystem: 'iOS, Android, Web',
            applicationCategory: 'MusicApplication',
            offers: {
              '@type': 'Offer',
              price: '3.99',
              priceCurrency: 'EUR',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              reviewCount: '1024',
            },
            description:
              'Interactive AI rap training environment. Select beats, control word frequency, and improve your flow.',
          }),
        }}
      />
      <div className="min-h-screen pt-4 pb-4 px-4 md:px-8 max-w-7xl mx-auto space-y-4">
        {/* Header */}

        {/* Classic Centralized Layout */}
        <div className="relative flex flex-col items-center justify-start pt-8 md:pt-12 min-h-[calc(100vh-100px)]">
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
                isPlaying={beatPlayer.isPlaying}
                isLoading={!isLoaded && !selectedBeat}
                currentTime={monotonicTime}
                sessionDuration={sessionDuration}
                handleToggle={handlePlayPause}
                handleBeatSelect={handleBeatSelection}
                difficulty={difficulty}
                frequency={frequency}
                isRecording={isRecording}
                mode={mode}
                activePlayer={activePlayer}
                cypherPlayers={cypherPlayers}
                isSirenActive={isSirenActive}
                sirenPhase={sirenPhase}
                recordingDuration={duration}
                isPro={isPro}
                isAuthenticated={!!session?.user || true}
                currentWord={currentWord}
                countdownValue={_countdownValue}
                isRecordingEnabled={isRecordingEnabled}
                handleDifficultyChange={setDifficulty}
                handleFrequencyChange={setFrequency}
                handleUpgrade={() => setPremiumTrigger('recording')}
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 rounded-full border-2 border-accent-purple/20 border-t-accent-purple animate-spin" />
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest animate-pulse">
                  {loadingText}
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

        {/* Exit Confirmation Modal */}
        <Modal
          isOpen={showExitConfirmation}
          onClose={() => setShowExitConfirmation(false)}
          title="Leave Session?"
          className="max-w-sm"
        >
          <div className="space-y-6">
            <p className="text-text-secondary text-center">
              Are you sure you want to leave? Your current session will be
              discarded and not recorded.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-text-secondary"
                onClick={() => setShowExitConfirmation(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                onClick={confirmExit}
              >
                Leave & Discard
              </Button>
            </div>
          </div>
        </Modal>

        {/* Combo Overlay */}
        <FlowComboOverlay combo={combo} />
      </div>
    </OnboardingLayout>
  )
}

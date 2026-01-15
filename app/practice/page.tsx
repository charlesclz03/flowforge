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

import { GuestLoginModal } from '@/components/molecules/auth/GuestLoginModal'
import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'
import SessionSummaryModal from '@/components/molecules/practice/SessionSummaryModal'
import { ScreenPage } from '@/components/layout/ScreenPage'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

import PracticeControls from '@/components/organisms/practice/PracticeControls'
import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/atoms/Modal'

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
  // Ring animation logic updated to track word duration
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
    setDifficulty,
    setFrequency,
    beatVolume,
    isTTSEnabled,
    ttsVolume,
    isLoaded,
    isRecordingEnabled,
    mode,
    cypherPlayers,
    startSession,
    stopSession,
  } = usePracticeSession()

  // Local State
  const [currentWord, setCurrentWord] = useState<string>('')
  const [wordList, setWordList] = useState<string[]>([])
  const [wordIndex, setWordIndex] = useState(0)
  const [sessionDuration] = useState(SESSION_CONFIG.DEFAULT_DURATION_SECONDS)
  /* saveMessage removed */
  const [combo, setCombo] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const shouldSaveRef = useRef(true)
  const isStoppingRef = useRef(false) // Guard against race conditions

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
      'Syncing Word Bank...',
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
  const animationFrameRef = useRef<number | null>(null) // StrictMode guard: prevents duplicate loops
  const [monotonicTime, setMonotonicTime] = useState(0)
  const [isSirenActive, setIsSirenActive] = useState(false)
  const [sirenPhase, setSirenPhase] = useState(0) // 0 or 1 for red/blue

  const [_countdownValue, setCountdownValue] = useState<number | 'GO' | null>(
    null
  )
  // Pending Action State for Safety Modal
  // 'exit' -> Go to difficulty selection
  // 'restart' -> Stop and restart session (countwodn)
  // 'finish' -> Stop and save session
  const [pendingAction, setPendingAction] = useState<
    'exit' | 'restart' | 'finish' | null
  >(null)

  // Track relative timing for the UI ring
  const [wordTiming, setWordTiming] = useState({ start: 0, duration: 0 })

  const stopTTS = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause()
      window.speechSynthesis.cancel()
    }
  }, [])

  const stopPlayback = useCallback(() => {
    beatPlayer.stop()
    stopTTS()
    releaseLock()
    sessionTimeRef.current = 0
    setMonotonicTime(0)
    setCurrentWord('')
    forceUpdate() // Ensure UI updates
  }, [beatPlayer, forceUpdate, releaseLock, stopTTS])

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
        // 1. Immediate Feedback: Play Success Sound & Mark Saved
        play('success')
        markAsSaved()

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

  // Volume Sync
  useEffect(() => {
    beatPlayer.setVolume(beatVolume)
  }, [beatVolume, beatPlayer])

  // Recording Complete Handler
  const handleRecordingComplete = useCallback(
    async (blob: Blob, recordedDuration: number) => {
      if (!shouldSaveRef.current) {
        console.log('Session discarded, skipping save')
        return
      }

      // Infinite Mode Check
      if (isInfiniteMode) {
        toast('Session Completed (Practice Mode)', {
          icon: '🎤',
        })
        // handleStop logic inlined to avoid circular dependency
        play('stop')
        shouldSaveRef.current = true
        stopPlayback()
        setIsPaused(false)
        return
      }

      if (recordedDuration < 3) {
        toast.error('Recording too short to save (min 3s)')
        return
      }

      if (blob.size < 1000) {
        console.warn('Recording too small', blob.size)
        // toast.error('No audio detected.', { icon: '🎤' }) // Reduced noise for "silent" tests
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
            toast.error('Could not save temp recording. Please sign in.')
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
      saveSessionOptimistic,
      shouldSaveRef,
      stopPlayback,
      play,
      setIsPaused,
    ]
  )

  // Recording Hook
  const {
    isRecording,
    duration,
    start: startRecording,
    stop: stopRecording,
    pause: pauseRecording,
    resume: resumeRecording,
    markAsSaved,
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

  // Pause Logic
  const togglePause = useCallback(async () => {
    if (isPaused) {
      // Resume
      try {
        await beatPlayer.play()
        if (isRecording) resumeRecording()
        setIsPaused(false)
      } catch (e) {
        console.error('Resume failed', e)
        toast.error('Failed to resume playback')
      }
    } else {
      // Pause
      beatPlayer.pause()
      if (isRecording) pauseRecording() // Handled by hook
      setIsPaused(true)
    }
  }, [isPaused, isRecording, beatPlayer, resumeRecording, pauseRecording])

  // Handlers

  const startCountdown = useCallback(async () => {
    if (!selectedBeat) return

    // Shuffle words for a fresh start every time we begin
    setWordList((prev) => [...prev].sort(() => Math.random() - 0.5))

    // Final check for loading errors
    if (beatPlayer.error) {
      toast.error(`Cannot start: ${beatPlayer.error}`)
      return
    }

    // Reset Stopping Guard
    isStoppingRef.current = false

    // COUNTDOWN LOGIC
    // User requested stable countdown speed regardless of BPM.
    // We use a fixed 800ms tick for a consistent "Ready, Set, Go" pace.
    const tickMs = 800
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
      await new Promise((r) => setTimeout(r, tickMs))
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
      startSession()
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
    startSession,
  ])

  const handleStop = useCallback(() => {
    isStoppingRef.current = true // Sync Guard
    play('stop')
    shouldSaveRef.current = true // Default to save
    stopTTS()
    stopSession()
    stopPlayback()
    stopRecording() // This will trigger handleRecordingComplete
    setIsPaused(false)
  }, [play, stopRecording, stopPlayback, stopSession, stopTTS])

  const handleDiscard = useCallback(() => {
    if (confirm('Discard this session? It will not be saved.')) {
      isStoppingRef.current = true // Sync Guard
      play('click')
      shouldSaveRef.current = false // Prevent save
      stopTTS() // Immediate silence
      stopSession() // Mark session as inactive
      stopPlayback()
      stopRecording()
      setIsPaused(false)
      toast('Session Discarded', { icon: '🗑️' })
      router.push('/difficultyselection')
    }
  }, [play, stopRecording, stopPlayback, router, stopTTS, stopSession])

  const handleBackNavigation = useCallback(() => {
    if (isRecording || beatPlayer.isPlaying) {
      // Pause playback while deciding
      if (beatPlayer.isPlaying) beatPlayer.pause()
      setPendingAction('exit')
      setShowExitConfirmation(true)
    } else {
      router.push('/difficultyselection')
    }
  }, [isRecording, beatPlayer, router])

  const confirmExit = useCallback(() => {
    isStoppingRef.current = true // Sync Guard
    stopTTS()
    setShowExitConfirmation(false)

    if (pendingAction === 'restart') {
      // Cleanest way is to stop everything, then effectively "press start" again
      // handleStop clears session state
      play('click')
      shouldSaveRef.current = false // Don't save abandoned session
      stopSession()
      stopPlayback()
      stopRecording()
      setIsPaused(false)

      // Short delay to allow state to settle before restarting
      setTimeout(() => {
        startCountdown()
      }, 100)
    } else if (pendingAction === 'finish') {
      // User chose to Finish and Save
      handleStop() // This saves by default (shouldSaveRef defaults true in handleStop)
    } else {
      // Default: Exit
      handleStop()
      router.push('/difficultyselection')
    }
    setPendingAction(null)
  }, [
    handleStop,
    router,
    stopTTS,
    pendingAction,
    play,
    stopPlayback,
    stopRecording,
    stopSession,
    startCountdown,
  ])

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
          `/api/words/random?difficulty=${difficulty}&count=100`
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
      // Safety: Don't speak if playback is stopped (unless forced e.g. test)
      if (!force && !beatPlayer.isPlaying && !isRecording) return
      // Safety: Strict Ref Check for race conditions
      if (isStoppingRef.current && !force) return

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
    [isTTSEnabled, ttsVolume, voice, beatPlayer.isPlaying, isRecording]
  )

  const handlePlayPause = useCallback(async () => {
    if (!selectedBeat) return

    if (beatPlayer.isPlaying) {
      play('stop')
      stopTTS() // Immediate silence
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
  }, [
    play,
    selectedBeat,
    beatPlayer,
    isRecording,
    handleStop,
    startCountdown,
    stopTTS,
  ])

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

  const handleRestart = useCallback(() => {
    if (isRecording || beatPlayer.isPlaying) {
      if (beatPlayer.isPlaying) beatPlayer.pause()
      setPendingAction('restart')
      setShowExitConfirmation(true)
    } else {
      // Just start over if not running (rare)
      startCountdown()
    }
  }, [isRecording, beatPlayer, startCountdown])

  const handleCenterStop = useCallback(() => {
    if (isRecording) {
      if (beatPlayer.isPlaying) beatPlayer.pause()
      setPendingAction('finish')
      setShowExitConfirmation(true)
    } else {
      handlePlayPause()
    }
  }, [isRecording, beatPlayer, handlePlayPause])

  // Sync Logic
  const sessionStateRef = useRef({
    lastWordIndex: -1,
    isActive: false,
    nextWordChangeTime: 0,
    lastFreq: 0, // Track frequency changes
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
      // Clean up any stray animation loop
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    // StrictMode Guard: If loop is already running, don't start another
    if (animationFrameRef.current !== null) {
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

      if (!state.isActive) {
        animationFrameRef.current = null
        return
      }
      const params = paramsRef.current
      if (!params.selectedBeat || params.wordList.length === 0) {
        animationFrameRef.current = null
        return
      }

      // Increment monotonic session time
      sessionTimeRef.current += delta
      const sessionTime = sessionTimeRef.current
      setMonotonicTime(sessionTime)

      // GRACE PERIOD: Ignore stop conditions for the first 1.5 seconds
      if (sessionTime > 1.5) {
        if (sessionTime >= params.sessionDuration) {
          handleStop()
          animationFrameRef.current = null
          return
        }
      }

      // Pause Check
      if (isPaused) {
        lastFrameTime = now // Keep updating lastFrameTime to avoid jump
        animationFrameRef.current = requestAnimationFrame(updateLoop)
        return
      }

      // Timing Logic - GRID LOCK IMPLEMENTATION
      // Calculates strictly based on Bar Count to prevent drift
      const secondsPerBeat = 60 / params.selectedBeat.bpm
      const secondsPerBar = secondsPerBeat * 4

      // Calculate absolute position in the song's structure
      // We accept negative time (intro) but only count positive for words
      const absTime = Math.max(0, sessionTime)
      const barsElapsed = absTime / secondsPerBar

      // Calculate which "Phrase Chunk" we are in (e.g. Chunk 0 = Bar 1-4, Chunk 1 = Bar 5-8)
      const safeFreq = Number(params.frequency) || 4

      // Frequency Change Watcher - Critical for Timer Ring
      if (safeFreq !== state.lastFreq) {
        // Frequency changed! Force re-evaluation
        state.lastFreq = safeFreq
        // Resetting index allows the loop to "catch up" if we switched to a slower freq
        // or trigger immediately if we switched to faster
        state.lastWordIndex = -1
        state.nextWordChangeTime = 0
      }

      const currentPhraseIndex = Math.floor(barsElapsed / safeFreq)

      // DEBUG: Trace potential issues with Frequency (dev only)
      if (process.env.NODE_ENV === 'development') {
        if (Math.abs(barsElapsed % 1) < 0.05 && Math.random() < 0.1) {
          console.log('[GridLock] State:', {
            freq: params.frequency,
            freqType: typeof params.frequency,
            bar: barsElapsed.toFixed(2),
            phrase: currentPhraseIndex,
            bpm: params.selectedBeat.bpm,
          })
        }
      }

      // Initial Sync or Phrase Change Trigger
      // We check if we've moved to a new phrase index since the last frame
      if (
        state.lastWordIndex === -1 ||
        currentPhraseIndex > state.lastWordIndex
      ) {
        // Critical: Update the tracking index immediately
        // Use the mathematical phrase index as the source of truth
        state.lastWordIndex = currentPhraseIndex

        // Calculate the NEXT change time purely for the Visualizer/UI Ring
        // (Phrase + 1) * BarsPerPhrase * SecondsPerBar
        const nextTargetBar = (currentPhraseIndex + 1) * params.frequency
        state.nextWordChangeTime = nextTargetBar * secondsPerBar

        // Get Next Word
        // We use the phrase index to drive the word list, ensuring deterministic order if not random
        const actualIndex = currentPhraseIndex % params.wordList.length
        const newWord = params.wordList[actualIndex]

        if (newWord) {
          setCurrentWord(newWord)
          setWordIndex(currentPhraseIndex) // Drives UI key

          // Visual Timer Setup
          const duration = state.nextWordChangeTime - sessionTime
          setWordTiming({ start: sessionTime, duration })

          if (params.isTTSEnabled) speak(newWord)
        }
      }

      // Siren Logic: Dynamic threshold
      // Either 4 seconds OR 60% of the duration (whichever is smaller)
      // This prevents the siren from being "always on" for short durations
      const wordDuration = secondsPerBar * params.frequency
      const sirenThreshold = Math.min(4, wordDuration * 0.6)
      const timeUntilNext = state.nextWordChangeTime - sessionTime
      const sirenActive = timeUntilNext <= sirenThreshold && timeUntilNext > 0

      setIsSirenActive(sirenActive)

      // sirenPhase toggles every 150ms during siren
      if (sirenActive) {
        setSirenPhase(Math.floor(sessionTime / 0.15) % 2)
      }

      forceUpdate()
      animationFrameRef.current = requestAnimationFrame(updateLoop)
    }

    // Start the loop and store frame ID
    animationFrameRef.current = requestAnimationFrame(updateLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beatPlayer.isPlaying, handleStop, speak, forceUpdate, isPaused])

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
        handleCenterStop()
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
    handleCenterStop,
    isRecording,
    beatPlayer.isPlaying,
    startRecording,
    isPro,
    play,
  ])

  useEffect(() => {
    const handleVisibilityChange = () => {
      // If hidden and playing, Pause (don't Stop/Finish)
      if (document.hidden && beatPlayer.isPlaying) {
        beatPlayer.pause()
        // We can't easily call togglePause here because it toggles, and we want explicit PAUSE.
        // But we DO want to update proper state if possible.
        // For now, pausing audio is the critical part to stop noise.
        // Ideally, we'd invoke the pause logic from togglePause.
      }
    }
    window.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      window.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [beatPlayer])

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
    <ScreenPage
      header={
        <AppHeader
          showBackButton
          onBack={handleBackNavigation}
          customTitle="THE BOOTH"
          customSubtitle="Step up and drop your bars"
        />
      }
      className="bg-background h-[100dvh] overflow-hidden"
    >
      {/* Schema.org - App Metadata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'FreeStyla',
            applicationCategory: 'LifestyleApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              reviewCount: '1024',
            },
            description:
              'Interactive freestyle practice environment. Select beats, control word frequency, and improve your flow.',
          }),
        }}
      />
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent-purple/20 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent-blue/10 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center h-[100dvh] px-4 pb-16 md:pb-8 max-w-lg mx-auto w-full overflow-hidden">
        {/* Combo / Vibe Overlay - Absolute Top Right */}
        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="absolute top-4 right-4 z-20 pointer-events-none"
            >
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-accent-purple/30 shadow-glow-sm">
                <span className="text-xl">🔥</span>
                <span className="font-bold font-mono text-accent-purple">
                  {combo}x
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Siren Overlay (Global Background Flash) */}
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

        {/* Main Controls - Centered */}
        <div className="w-full flex-none z-20 flex items-center justify-center">
          {selectedBeat ? (
            <PracticeControls
              selectedBeat={selectedBeat}
              beats={beats}
              isPlaying={beatPlayer.isPlaying}
              isLoading={!isLoaded || beatPlayer.isLoading}
              currentTime={monotonicTime}
              sessionDuration={sessionDuration}
              handleToggle={handleCenterStop}
              handleRestart={handleRestart}
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
              error={error?.message || null}
              isPro={isPro}
              isAuthenticated={!!session?.user}
              currentWord={currentWord}
              countdownValue={_countdownValue}
              isRecordingEnabled={isRecordingEnabled}
              handleDifficultyChange={setDifficulty}
              handleFrequencyChange={setFrequency}
              handleUpgrade={() => setPremiumTrigger('recording')}
              isGolden={false}
              isPaused={isPaused}
              onTogglePause={togglePause}
              onDiscard={handleDiscard}
              wordTiming={wordTiming}
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

      <SessionSummaryModal
        data={sessionSummary}
        onClose={() => {
          setSessionSummary(null)
          router.push('/recordings')
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
        beatCount={beats.length || 100}
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
              ? 'Are you sure you want to restart? Current progress will be lost.'
              : pendingAction === 'finish'
                ? 'Stop recording and save your session?'
                : 'Your recording is in progress. Leaving now will discard this session.'}
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowExitConfirmation(false)
                setPendingAction(null)
                // Resume playback if it was paused
                if (!beatPlayer.isPlaying) {
                  beatPlayer.play().catch(console.error)
                }
              }}
            >
              Resume
            </Button>
            <Button
              variant={pendingAction === 'finish' ? 'primary' : 'danger'}
              onClick={confirmExit}
            >
              {pendingAction === 'restart'
                ? 'Restart'
                : pendingAction === 'finish'
                  ? 'Finish & Save'
                  : 'Stop & Exit'}
            </Button>
          </div>
        </div>
      </Modal>
    </ScreenPage>
  )
}

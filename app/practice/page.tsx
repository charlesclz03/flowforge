'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { EyeOff, Eye } from 'lucide-react'
import { PracticeTemplate } from '@/components/templates'
import { PageHeader } from '@/components/organisms/common'
import { PracticeControls } from '@/components/organisms/practice/PracticeControls'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { SuccessAlert } from '@/components/molecules/feedback/SuccessAlert'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { toast } from 'react-hot-toast'
import { useBeatPlayer } from '@/hooks/useBeatPlayer'
import { useRecording } from '@/hooks/useRecording'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useForceUpdate } from '@/hooks/useForceUpdate'
import { SESSION_CONFIG } from '@/lib/constants/design'
import { ErrorCodes } from '@/lib/errors'
import { usePracticeSession } from '@/contexts/SessionContext'
import { GuestStorage } from '@/lib/guest-storage'
import { GuestLoginModal } from '@/components/auth/GuestLoginModal'
import { BeatDropdown } from '@/components/molecules/practice/BeatDropdown'
import { useWakeLock } from '@/hooks/useWakeLock'
import { FirstVisitOverlay } from '@/components/onboarding/FirstVisitOverlay'
import { AudioVisualizer } from '@/components/molecules/visuals/AudioVisualizer'
import { SessionSummaryModal } from '@/components/molecules/practice/SessionSummaryModal'
import { ErrorBoundary } from '@/components/utils/ErrorBoundary'

import { Beat } from '@/types/database'
import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'

export default function PracticePage() {
  const router = useRouter()
  const { data: session } = useSession()
  /* Clean UI State */
  const [cleanUI, setCleanUI] = useState(false)
  const [proTipDismissed, setProTipDismissed] = useState(false)

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
    mode,
  } = usePracticeSession()
  // ... (rest of vars)
  // ...

  const [currentWord, setCurrentWord] = useState<string>('')
  const [wordList, setWordList] = useState<string[]>([])
  const [wordIndex, setWordIndex] = useState(0) // Track index for Golden Prompt
  const [sessionDuration] = useState(SESSION_CONFIG.DEFAULT_DURATION_SECONDS)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [showGuestModal, setShowGuestModal] = useState(false)

  // Derived state
  const usedWords = wordList.slice(0, wordIndex + 1)

  // Premium Modal State
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [premiumTrigger, setPremiumTrigger] = useState<'recording' | 'beat' | 'history'>('beat')

  // Session Summary / Vibe Check
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessionSummary, setSessionSummary] = useState<any>(null)

  const { error, handleError, clearError } = useErrorHandler()
  const forceUpdate = useForceUpdate()
  const { requestLock, releaseLock } = useWakeLock()
  // ... inside PracticePage
  const [beats, setBeats] = useState<Beat[]>([])
  const [_isLoadingBeats, setIsLoadingBeats] = useState(true)
  const [restartCount, setRestartCount] = useState(0)
  const [playbackCount, setPlaybackCount] = useState(0)

  // ...

  // Parallel Fetch Initialization
  useEffect(() => {
    const initSession = async () => {
      setIsLoadingBeats(true)
      try {
        const [beatsRes, wordsRes] = await Promise.all([
          fetch('/api/beats'),
          fetch(`/api/words/random?difficulty=${difficulty}&count=100`),
        ])

        const [beatsData, wordsData] = await Promise.all([beatsRes.json(), wordsRes.json()])

        if (beatsData.beats) setBeats(beatsData.beats)
        if (wordsData.words) {
          const words = wordsData.words.map((w: { wordText: string }) => w.wordText)
          setWordList(words)
          if (!currentWord && words.length > 0) setCurrentWord(words[0])
        }
      } catch (err) {
        console.error('Initialization error:', err)
        handleError(err, ErrorCodes.BEAT_LOAD_FAILED) // Corrected from FETCH_DATA_FAILED
      } finally {
        setIsLoadingBeats(false)
      }
    }

    initSession()

    // Bible 2.1: Context Resume & TTS Warm-up
    const warmUpTTS = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance('')
        u.volume = 0
        window.speechSynthesis.speak(u)
      }
    }
    warmUpTTS()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentional once on mount to avoid fetch loops during session

  // ...

  // Determine if user is pro
  const isPro =
    session?.user?.subscriptionStatus === 'active' ||
    session?.user?.subscriptionStatus === 'trialing'

  // Audio hooks
  const beatPlayer = useBeatPlayer()

  // Handle stop (logic detached from recording hook for circular dependency resolution)
  const stopPlayback = useCallback(() => {
    beatPlayer.stop()
    releaseLock()
    setCurrentWord(wordList[0] || '')
    forceUpdate()
  }, [beatPlayer, wordList, forceUpdate, releaseLock])

  const handleBeatChange = (beat: Beat) => {
    setBeat(beat)
    stopPlayback()
  }

  // Challenge Logic
  const searchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const challengeId = searchParams?.get('challengeId')

  useEffect(() => {
    if (challengeId) {
      // Fetch challenge details
      // Actually, let's use the server action we created: getChallengeSession
      // But we can't call server action directly in useEffect easily without wrapping or treating it as promise.
      // Next.js Server Actions can be called from client components.

      const loadChallenge = async () => {
        try {
          // Dynamic import to avoid server-side module issues in client component if checking 'use server' isn't enough?
          // Actually, we can just import it.
          const { getChallengeSession } = await import('@/app/actions/social')
          const data = await getChallengeSession(challengeId)

          if (data && data.beat) {
            setBeat(data.beat)
            // setFrequency(data.frequency) // Need setters in context if we want to force it
            // setDifficulty(data.difficulty)
            // For now, just setting the beat is the MVP "Duel".
            // Ideally we show a banner "Challenging..."
          }
        } catch (err) {
          console.error('Failed to load challenge', err)
        }
      }
      loadChallenge()
    }
  }, [challengeId, setBeat])

  // Guest Save Warning: Prevent accidental refresh/close during recording

  const handleRecordingComplete = useCallback(
    async (blob: Blob, recordedDuration: number) => {
      // Minimum size threshold (e.g., 1KB) to filter out "silence" or failed inits
      if (blob.size < 1000) {
        console.warn('Recording blob is empty or too small', blob.size)
        toast.error('No audio detected. Please check your microphone.', {
          icon: '🎤',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
        return
      }

      // Duration threshold (prevent accidental clicks)
      if (recordedDuration < 2) {
        toast.error('Recording too short. Keep flowing!', { icon: 'too-short' })
        return
      }

      if (selectedBeat) {
        if (session?.user) {
          try {
            const measuredDuration = Math.round(recordedDuration)
            const fallbackDuration = blob.size > 0 ? Math.max(1, Math.round(blob.size / 16000)) : 1
            const actualDuration = Math.max(
              1,
              measuredDuration > 0 ? measuredDuration : fallbackDuration
            )

            // Scoring and Vibe Check (Phase 8 V2)
            const vibe = 'Freestyle Flow'
            const description = 'Nice session!'
            const finalScore = 0

            const formData = new FormData()
            formData.append('audio', blob, 'recording.webm')
            formData.append('beatId', selectedBeat.id)
            formData.append('title', `${selectedBeat.title} - ${new Date().toLocaleDateString()}`)
            formData.append('durationSeconds', actualDuration.toString())
            formData.append('frequency', frequency.toString())
            formData.append('difficulty', difficulty.toString())
            formData.append('score', finalScore.toString()) // Use Penalized & Combined Score
            formData.append('vibe', vibe)
            formData.append('wordsUsed', JSON.stringify(usedWords))
            formData.append('restarts', restartCount.toString())
            formData.append('playbacks', playbackCount.toString())

            if (challengeId) {
              formData.append('parentId', challengeId)
            }

            const response = await fetch('/api/recordings', {
              method: 'POST',
              body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
              throw new Error(data.error || 'Failed to save recording')
            }

            // Show Session Summary Modal
            setSessionSummary({
              score: finalScore,
              vibe: vibe,
              description: description,
              wordCount: usedWords.length,
              duration: actualDuration,
              audioUrl: URL.createObjectURL(blob),
            })

            // setSaveMessage('Recording saved successfully! View it in your recordings library.')
            // setTimeout(() => setSaveMessage(null), 5000)

            // Check for new badges
            if (data.session?.newBadges && Array.isArray(data.session.newBadges)) {
              data.session.newBadges.forEach((badge: string) => {
                toast.success(`Achievement Unlocked: ${badge}!`, {
                  icon: '🏆',
                  duration: 5000,
                  style: {
                    background: 'linear-gradient(to right, #6b21a8, #c026d3)',
                    color: '#fff',
                    fontWeight: 'bold',
                  },
                })
              })
            }
          } catch (err) {
            handleError(err, ErrorCodes.SESSION_SAVE_FAILED)
          }
        } else {
          // Guest Mode: Save to local storage and prompt login
          try {
            const measuredDuration = Math.round(recordedDuration)
            const fallbackDuration = blob.size > 0 ? Math.max(1, Math.round(blob.size / 16000)) : 1
            const actualDuration = Math.max(
              1,
              measuredDuration > 0 ? measuredDuration : fallbackDuration
            )

            const metadata = {
              beatId: selectedBeat.id,
              beatTitle: selectedBeat.title,
              frequency: frequency,
              difficulty: difficulty,
              duration: actualDuration,
              createdAt: Date.now(),
              // Guest mode doesn't strictly need persistent score yet but good to have
            }

            // Save to IndexedDB
            await GuestStorage.saveSession(blob, metadata)

            // Show modal
            setShowGuestModal(true)
          } catch (err) {
            console.error('Failed to save guest session:', err)
            // Fallback: just ask them to sign in, they might lose this specific take but at least they convert
            // But realistically we want to tell them.
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
      challengeId,
      usedWords,
      restartCount,
      playbackCount,
    ]
  )

  const {
    isRecording,
    duration,
    start: startRecording,
    stop: stopRecording,
    resume: resumeRecording,
    stream, // New stream prop
  } = useRecording({
    maxDuration: isPro ? null : 120, // 2 minutes for free, unlimited for pro
    onComplete: (blob, duration) => handleRecordingComplete(blob, duration),
    onMaxDurationReached: () => {
      stopPlayback() // Stop the beat and UI
      // Note: Recorder stops automatically
      if (!isPro) {
        setPremiumTrigger('recording')
        setShowPremiumModal(true)
      }
    },
  })

  // Main stop handler for button click
  const handleStop = useCallback(() => {
    stopRecording()
    stopPlayback()
  }, [stopRecording, stopPlayback])

  // Redirect to setup if there is no configured beat
  useEffect(() => {
    // Check for first visit (Tutorial active)
    const isFirstVisit =
      typeof window !== 'undefined' && !localStorage.getItem('flowforge_first_visit_complete')

    if (isLoaded && !selectedBeat && !challengeId && !isFirstVisit) {
      router.push('/difficultyselection')
    }
  }, [isLoaded, selectedBeat, router, challengeId])

  // Load beat audio when selected
  useEffect(() => {
    if (selectedBeat) {
      const beatMetadata = {
        id: selectedBeat.id,
        title: selectedBeat.title,
        bpm: selectedBeat.bpm,
        storageUrl: selectedBeat.storageUrl,
        isPremium: selectedBeat.isPremium,
        genre: selectedBeat.genre,
        duration: selectedBeat.duration,
        artistName: selectedBeat.artistName,
      }
      beatPlayer.loadBeat(beatMetadata)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBeat?.id])

  // Fetch words when beat and difficulty are selected
  // Fetch words when beat and difficulty are selected
  useEffect(() => {
    if (!selectedBeat) return

    async function fetchWords() {
      try {
        // Bible 5.2: Bag System - Fetch a larger pool to prevent repeats even with skips
        const wordsNeeded = 100
        const response = await fetch(
          `/api/words/random?difficulty=${difficulty}&count=${wordsNeeded}`
        )
        const data = await response.json()

        if (data.words && data.words.length > 0) {
          const words = data.words.map((w: { wordText: string }) => w.wordText)
          setWordList(words)
        }
      } catch (err) {
        handleError(err, ErrorCodes.FETCH_WORDS_FAILED)
      }
    }

    fetchWords()
  }, [selectedBeat, difficulty, frequency, sessionDuration, handleError])

  // TTS Voice State
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

    // Initialize voice
    const setBestVoice = () => {
      const v = getBestVoice()
      if (v) setVoice(v)
    }

    setBestVoice()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = setBestVoice
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  // Robust Speak Helper
  const speak = useCallback(
    (text: string, force = false) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return

      if (!isTTSEnabled && !force) return

      // Instead of cancel(), we check for speaking to avoid "jams"
      // but only if we really need to clear the air.
      // window.speechSynthesis.cancel()

      const u = new SpeechSynthesisUtterance(text)
      u.rate = 1.1 // Slightly slower for better clarity
      u.volume = ttsVolume
      if (voice) u.voice = voice

      window.speechSynthesis.speak(u)
    },
    [isTTSEnabled, ttsVolume, voice]
  )

  // Countdown Logic
  const [_countdownValue, setCountdownValue] = useState<number | 'GO' | null>(null)

  const startCountdown = useCallback(async () => {
    if (!selectedBeat) return

    // Calculate exact duration per beat in ms
    const msPerBeat = (60 / selectedBeat.bpm) * 1000

    // Sequence: 3 -> 2 -> 1 -> GO (Start Playback immediately on GO)
    // We want the playback to start EXACTLY when the 4th beat hits (zero index).
    // Current flow:
    // Beat 1: Speak "3"
    // Beat 2: Speak "2"
    // Beat 3: Speak "1"
    // Beat 4: Speak "Go" AND Start Playback

    // Sequence: 3 -> 2 -> 1 -> GO -> PLAY
    // User requested: "Start after the count 3 2 1 GO".
    // This implies 4 full beats of count/prep before audio drops on the 5th beat (or late 4th).
    // Previous: 3, 2, 1 (Wait) -> GO + Play. (Audio on Beat 4).
    // New: 3, 2, 1, GO (Wait) -> Play. (Audio on Beat 5).

    // Audio Context for Beeps
    const playBeep = (freq: number = 440, type: OscillatorType = 'sine') => {
      if (typeof window === 'undefined') return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
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

    const countSequence = [3, 2, 1, 'GO']

    for (const val of countSequence) {
      setCountdownValue(val as number | 'GO')
      // speak(val.toString(), true) // Replaced with Beep
      if (val === 'GO') {
        playBeep(880, 'square') // Higher pitch, distinct sound for GO
      } else {
        playBeep(440, 'sine') // Standard beep
      }
      await new Promise((r) => setTimeout(r, msPerBeat))
    }

    // THE DROP (After GO wait)
    clearError()
    if (wordList.length > 0 && !currentWord) {
      setCurrentWord(wordList[0])
    }

    try {
      // FIRE AUDIO
      beatPlayer.play()

      // Handle Recording
      if (!isRecording) {
        await requestLock()
        if (isPro) {
          startRecording(true).catch(console.error)
        }
      } else {
        resumeRecording()
      }
    } catch (err) {
      handleError(err, ErrorCodes.AUDIO_PLAYBACK_FAILED)
    }

    // Clear countdown display shortly after drop
    setTimeout(() => {
      setCountdownValue(null)
    }, 1000)
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

  // Premium Gating (Unused for now)
  /*
  const [premiumTrigger, setPremiumTrigger] = useState<'recording' | 'beat' | 'history'>(
    'recording'
  )

  const triggerPremiumModal = (trigger: 'recording' | 'beat' | 'history') => {
    setPremiumTrigger(trigger)
    // setShowPremiumModal(true) // Unused
  }
  */
  /*
  const triggerPremiumModal = () => {} // Stub
  */

  // Modified Play/Record Handler
  const handlePlayPause = useCallback(async () => {
    if (!selectedBeat) return

    // If trying to record (or play which leads to record) and not pro?
    // User requirement: "Restricted Recording Access (Popup)"
    // But basic playback should be allowed?
    // Usually Practice Mode is Play+Record.
    // Let's assume Play is free, but Record is Pro? OR unlimited sessions are Pro?
    // "Unlimited Studio Recordings" is the perk.
    // For now, if they try to START a session (which implies recording in this app flow), check Pro?
    // Wait, previously `startRecording(!isPro)` was passed. The hook handles the limit?
    // The requirement says: "Clicking the Mic icon/Record button (if free user) -> Popup"
    // So we should BLOCK recording initiation completely if strictly enforced, OR let them record but block download?
    // "Restrict Recording Access (Popup)" suggests blocking entry.
    // But earlier logic allowed free users to record with limits.
    // I will enforce the BLOCK if that's the interpretation of "asking to be in paid tier... when clicking on the mic".
    // Yes, "ask to be in paid tier... when clicking on the mic icon".
    // So Free users cannot record? That contradicts "Free vs Pro duration limits".
    // Let's assume the Mic Click on `PracticeControls` (if it existed) triggers it.
    // But `PracticeControls` has a Play button that starts the countdown -> recording.
    // So hitting PLAY starts recording.
    // If I block PLAY, they can't practice.
    // Maybe the user means a specific "Record Only" mode or just the implicit recording?
    // "Clicking on the mic icon recorder" -> This implies there IS a mic icon.
    // `RecordingIndicator` has a mic icon but it's an indicator.
    // `PracticeControls` has `PlayButton`.
    // I will assume the `handlePlayPause` is the trigger.
    // IF `isRecording` is false and we are about to start:
    // Check if user wants to Record.
    // Actually, `startCountdown` calls `startRecording`.
    // Let's intercept `handlePlayPause`.

    // User said: "when clicking on the mic icon recorder".
    // Maybe they mean the `RecordingIndicator`? No, that's passive.
    // Maybe they mean a separate button?
    // The main button IS the play/record button.
    // I will block `startCountdown` if `!isPro` AND checking for specific "mic" intent?
    // Actually, let's look at `PracticeControls` again. It has `PlayButton`.
    // Maybe I should add the check in `startCountdown`.

    // Start Countdown Logic
    if (beatPlayer.isPlaying) {
      if (isRecording) {
        handleStop()
      } else {
        beatPlayer.pause()
      }
    } else {
      // STARTING
      // User clarification: Starting a session (Guest/Free) IS allowed.
      // "Hitting the record button summons it" -> This implies a separate interaction or intent.
      // For now, we allow the Countdown to start.
      // If we need to block "Recording" specifically, we do it inside startCountdown or separate UI.

      // Bible: Call AudioContext.resume() on interaction
      if (typeof window !== 'undefined') {
        const WinAudioContext =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (WinAudioContext) {
          const ctx = new WinAudioContext()
          if (ctx.state === 'suspended') {
            await ctx.resume()
          }
        }
      }

      setPlaybackCount((prev) => prev + 1)
      startCountdown()
    }
  }, [selectedBeat, isRecording, beatPlayer, handleStop, startCountdown])

  // Quick Restart (Bible 1.1)
  const handleRestart = useCallback(() => {
    beatPlayer.stop()
    stopRecording()
    setWordIndex(0)
    setRestartCount((prev) => prev + 1)
    setCurrentWord(wordList[0] || '')
    toast.success('Session Restarted', { icon: '🔄' })
  }, [beatPlayer, stopRecording, wordList])

  // Ref-based state for high-frequency tracking (prevents re-renders)
  const sessionStateRef = useRef({
    lastWordIndex: -1,
    lastFrameTime: 0,
    startTime: 0,
    isActive: false,
  })

  // Synchronization Loop (High Precision)
  useEffect(() => {
    if (!beatPlayer.isPlaying || !selectedBeat || wordList.length === 0) {
      sessionStateRef.current.isActive = false
      return
    }

    const state = sessionStateRef.current
    state.isActive = true
    state.startTime = Date.now()
    state.lastWordIndex = -1

    const secondsPerBar = (60 / selectedBeat.bpm) * 4
    const secondsPerPrompt = secondsPerBar * frequency

    const updateLoop = () => {
      if (!state.isActive) return

      // Use the new precise getter to avoid re-render-stale-props
      const elapsedSeconds = beatPlayer.getPreciseTime()

      // 1. Session End Check
      if (elapsedSeconds >= sessionDuration) {
        handleStop()
        return
      }

      // 2. Word Switching Logic
      const wordIdx = Math.floor(elapsedSeconds / secondsPerPrompt)
      const actualIndex = wordIdx % wordList.length

      if (wordIdx !== state.lastWordIndex) {
        state.lastWordIndex = wordIdx
        const newWord = wordList[actualIndex]

        if (newWord) {
          setCurrentWord(newWord)
          setWordIndex(wordIdx)
          speak(newWord)
        }
      }

      // 3. UI Synchronization
      // We still call forceUpdate here to keep the Timer Ring smooth,
      // but since useBeatPlayer is "silent", this is now the ONLY re-render source,
      // making it much lighter than before.
      forceUpdate()

      requestAnimationFrame(updateLoop)
    }

    const frameId = requestAnimationFrame(updateLoop)

    return () => {
      state.isActive = false
      cancelAnimationFrame(frameId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beatPlayer.isPlaying, selectedBeat?.id, frequency, wordList.length, sessionDuration])

  // Desktop Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.code === 'Space') {
        e.preventDefault() // Prevent scroll
        handlePlayPause()
      }

      if (e.code === 'KeyR') {
        if (!isRecording && beatPlayer.isPlaying) {
          startRecording(!isPro)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlePlayPause, isRecording, beatPlayer.isPlaying])

  // Visibility change ducking (Bible 2.1)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && beatPlayer.isPlaying) {
        handlePlayPause()
      }
    }
    window.addEventListener('visibilitychange', handleVisibilityChange)
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [beatPlayer.isPlaying, handlePlayPause])

  // Headphone Nudge (Bible 2.3)
  useEffect(() => {
    toast('🎧 Headphones recommended for studio quality.', {
      duration: 3000,
      position: 'bottom-center',
    })
  }, [])

  return (
    <OnboardingLayout
      showBackButton={!cleanUI}
      showHeader={!cleanUI}
      showSettings={!cleanUI}
      showProgress={!cleanUI}
      onBack={() => router.push('/difficultyselection')}
      className={cleanUI ? 'z-[100]' : ''}
    >
      <FirstVisitOverlay isBeatSelected={!!selectedBeat} />
      {cleanUI && (
        <style
          dangerouslySetInnerHTML={{ __html: `nav.safe-bottom { display: none !important; }` }}
        />
      )}

      {/* Restore UI Button (Visible only in Clean Mode) */}
      {cleanUI && (
        <button
          onClick={() => setCleanUI(false)}
          className="fixed top-6 right-6 z-[200] p-4 rounded-full bg-accent-purple/20 hover:bg-accent-purple/40 text-white backdrop-blur-heavy border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-purple-glow group"
          title="Restore UI"
        >
          <Eye size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="sr-only">Restore UI</span>
        </button>
      )}

      <PracticeTemplate
        pageHeader={
          !cleanUI ? (
            <PageHeader
              title={
                challengeId ? 'Duel Mode' : mode === 'cypher' ? 'Cypher Mode' : 'Freestyle Session'
              }
              description={
                challengeId
                  ? 'Drop your best response!'
                  : mode === 'cypher'
                    ? 'Pass the mic every 4 bars!'
                    : 'Press play to start your 2-minute freestyle.'
              }
              rightAction={
                <button
                  onClick={() => setCleanUI(!cleanUI)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
                  title="Toggle Clean UI"
                >
                  <EyeOff size={20} />
                </button>
              }
            />
          ) : null
        }
        alerts={
          <>
            {/* Cypher Turn Indicator */}
            {mode === 'cypher' && beatPlayer.isPlaying && !cleanUI && (
              <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div
                  className={`
                        px-8 py-4 rounded-full text-2xl font-black uppercase tracking-widest shadow-2xl border-4
                        transition-all duration-300 scale-110
                        ${
                          Math.floor(
                            (beatPlayer.currentTime || 0) /
                              ((60 / (selectedBeat?.bpm || 90)) * 4 * 4)
                          ) %
                            2 ===
                          0
                            ? 'bg-accent-purple border-accent-pink text-white rotate-1'
                            : 'bg-accent-cyan border-white text-black -rotate-1'
                        }
                    `}
                >
                  {Math.floor(
                    (beatPlayer.currentTime || 0) / ((60 / (selectedBeat?.bpm || 90)) * 4 * 4)
                  ) %
                    2 ===
                  0
                    ? 'PLAYER 1'
                    : 'PLAYER 2'}
                </div>
              </div>
            )}
            {saveMessage && (
              <SuccessAlert message={saveMessage} onDismiss={() => setSaveMessage(null)} />
            )}
            {error && <ErrorAlert error={error} onDismiss={clearError} />}
            <SessionSummaryModal
              data={sessionSummary}
              onClose={() => {
                setSessionSummary(null)
              }}
            />
          </>
        }
        beatSelector={
          !cleanUI ? (
            <BeatDropdown
              beats={beats}
              selectedBeat={selectedBeat}
              onSelect={handleBeatChange}
              isPro={isPro}
              disabled={beatPlayer.isPlaying || isRecording}
              isLoading={_isLoadingBeats}
              onLockedSelect={() => {
                setPremiumTrigger('beat')
                setShowPremiumModal(true)
              }}
            />
          ) : null
        }
        sessionConfig={
          !cleanUI && !proTipDismissed ? (
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-text-tertiary text-xs">
                <span className="font-bold text-accent-purple">PRO TIP:</span>
                <span className="flex-1">
                  Press <kbd className="font-sans font-bold text-white">Space</kbd> to Start/Pause
                </span>
                <button
                  onClick={() => setProTipDismissed(true)}
                  className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Dismiss tip"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : null
        }
        practiceControls={
          selectedBeat ? (
            <div className="relative w-full flex justify-center items-center">
              {/* Visualizer in background */}
              <div className="absolute inset-0 pointer-events-none opacity-30 z-0 scale-150">
                <AudioVisualizer
                  isPlaying={beatPlayer.isPlaying || isRecording}
                  mode={isRecording ? 'stream' : 'simulation'}
                  stream={stream}
                  className="w-full h-full"
                  color={isRecording ? '#F43F5E' : '#A855F7'}
                />
              </div>
              <div className="relative z-10 w-full flex justify-center">
                <ErrorBoundary name="Practice Recorder">
                  <PracticeControls
                    selectedBeat={selectedBeat}
                    isPlaying={beatPlayer.isPlaying}
                    isLoading={beatPlayer.isLoading}
                    currentTime={beatPlayer.currentTime || 0}
                    sessionDuration={sessionDuration}
                    currentWord={currentWord}
                    isRecording={isRecording}
                    recordingDuration={duration}
                    error={
                      beatPlayer.error ||
                      (typeof error === 'string' ? error : (error as Error)?.message) ||
                      null
                    }
                    onToggle={handlePlayPause}
                    onRestart={handleRestart}
                    difficulty={difficulty}
                    frequency={frequency}
                    // New Props
                    onDifficultyChange={setDifficulty}
                    onFrequencyChange={setFrequency}
                    cleanUI={cleanUI}
                    isGolden={(wordIndex + 1) % 50 === 0 && wordIndex > 0}
                  />
                </ErrorBoundary>
              </div>
            </div>
          ) : null
        }
        helpSection={null}
      />
      <GuestLoginModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        trigger={premiumTrigger}
      />
    </OnboardingLayout>
  )
}

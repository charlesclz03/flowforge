'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PracticeTemplate } from '@/components/templates'
import PracticeControls from '@/components/organisms/practice/PracticeControls'
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
import { AudioVisualizer } from '@/components/molecules/visuals/AudioVisualizer'
import SessionSummaryModal from '@/components/molecules/practice/SessionSummaryModal'
import { ErrorBoundary } from '@/components/utils/ErrorBoundary'

import { Beat } from '@/types/database'
import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'

export default function PracticePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isInfiniteMode, setIsInfiniteMode] = useState(false)

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
    wordCategory,
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
          fetch(
            `/api/words/random?difficulty=${difficulty}&count=100&category=${wordCategory || ''}`
          ),
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

  // Challenge Logic - Deprecated (Duels removed)
  // const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  // const challengeId = searchParams?.get('challengeId')

  // Guest Save Warning: Prevent accidental refresh/close during recording

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

            // if (challengeId) {
            //   formData.append('parentId', challengeId)
            // }

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
              newBadges: data.session?.newBadges,
              difficulty: difficulty,
              bpm: selectedBeat.bpm,
              frequency: frequency,
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
      // challengeId,
      usedWords,
      restartCount,
      playbackCount,
      isInfiniteMode,
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
    if (isLoaded && !selectedBeat) {
      router.push('/howitworks')
    }
  }, [isLoaded, selectedBeat, router])

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
        // Bible 5.2 & "1-Hour Rule": Bag System + History Filtering
        // We fetch more words than needed to allow for client-side filtering
        const fetchCount = 200

        // Handle "Random" difficulty (4) by omitting the parameter
        const diffParam = difficulty === 4 ? '' : `&difficulty=${difficulty}`

        const response = await fetch(`/api/words/random?count=${fetchCount}${diffParam}`)
        const data = await response.json()

        if (data.words && data.words.length > 0) {
          const fetchedWords = data.words as { id: string; wordText: string }[]

          // 1. Get History from LocalStorage
          const HISTORY_KEY = 'flowforge_seen_words'
          let seenHistory: Record<string, number> = {}
          try {
            const raw = localStorage.getItem(HISTORY_KEY)
            if (raw) seenHistory = JSON.parse(raw)
          } catch (e) {
            console.error('Failed to parse word history', e)
          }

          // 2. Prune History (Older than 1 hour)
          const ONE_HOUR = 60 * 60 * 1000
          const now = Date.now()
          Object.keys(seenHistory).forEach((wordId) => {
            if (now - seenHistory[wordId] > ONE_HOUR) {
              delete seenHistory[wordId]
            }
          })

          // 3. Filter Words
          let availableWords = fetchedWords.filter((w) => !seenHistory[w.id])

          // Fallback: If we filtered too aggressively, use original pool (Silent Recycling)
          if (availableWords.length < 10) {
            availableWords = fetchedWords
          }

          // 4. Update State
          const words = availableWords.map((w) => w.wordText)
          setWordList(words)

          // 5. Optimistically Update History
          // Mark all loaded words as "seen" now so they aren't fetched again next time.
          // This is a bulk "reservation" strategy suitable for this app.
          const nowTime = Date.now()
          availableWords.forEach((w) => {
            seenHistory[w.id] = nowTime
          })

          // Save pruned history back
          localStorage.setItem(HISTORY_KEY, JSON.stringify(seenHistory))
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

  // Keep latest params in ref to avoid effect restarts
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

  // Synchronization Loop (High Precision)
  useEffect(() => {
    // Only start if playing. Do NOT restart when params change.
    if (!beatPlayer.isPlaying) {
      sessionStateRef.current.isActive = false
      return
    }

    const state = sessionStateRef.current
    // Only initialize start state if not already active (prevent reset on re-mounts if that were to happen)
    // But actually, we want to respect the player.
    // Ideally this effect ONLY runs when isPlaying changes.
    state.isActive = true
    state.startTime = Date.now()
    // We do NOT reset lastWordIndex here if we are continuing?
    // Actually, if we just paused/played, we might want to reset or resume.
    // For now, let's reset to ensure clean slate on Play.
    state.lastWordIndex = -1

    const updateLoop = () => {
      // Check active inside the loop frame
      if (!state.isActive) return

      const params = paramsRef.current
      if (!params.selectedBeat || params.wordList.length === 0) return

      // Use the new precise getter to avoid re-render-stale-props
      const elapsedSeconds = beatPlayer.getPreciseTime()

      // 1. Session End Check
      if (elapsedSeconds >= params.sessionDuration) {
        handleStop()
        return
      }

      // 2. Word Switching Logic
      const secondsPerBar = (60 / params.selectedBeat.bpm) * 4
      const secondsPerPrompt = secondsPerBar * params.frequency

      const wordIdx = Math.floor(elapsedSeconds / secondsPerPrompt)
      const actualIndex = wordIdx % params.wordList.length

      if (wordIdx !== state.lastWordIndex) {
        state.lastWordIndex = wordIdx
        const newWord = params.wordList[actualIndex]

        if (newWord) {
          setCurrentWord(newWord)
          setWordIndex(wordIdx)

          // Use logic directly here to avoid closure staleness on 'speak' dependency
          if (params.isTTSEnabled) {
            speak(newWord)
          }
        }
      }

      // 3. UI Synchronization
      forceUpdate()

      requestAnimationFrame(updateLoop)
    }

    const frameId = requestAnimationFrame(updateLoop)

    return () => {
      state.isActive = false
      cancelAnimationFrame(frameId)
    }
    // Only re-run if play state changes.
    // We intentionally omit params from deps because we use paramsRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beatPlayer.isPlaying])

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
    // Pro Tip for desktop users
    setTimeout(() => {
      toast('💡 Press Space to Start/Pause', {
        duration: 4000,
        position: 'bottom-center',
      })
    }, 3500)
  }, [])

  return (
    <OnboardingLayout
      showBackButton={true}
      showHeader={true}
      showSettings={true}
      showProgress={true}
      onBack={() => router.push('/difficultyselection')}
    >
      <PracticeTemplate
        pageHeader={null}
        alerts={
          <>
            {/* Cypher Turn Indicator */}
            {mode === 'cypher' && beatPlayer.isPlaying && (
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
        }
        sessionConfig={null}
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
                    isGolden={(wordIndex + 1) % 50 === 0 && wordIndex > 0}
                    isPro={isPro}
                    isAuthenticated={!!session}
                    onUpgrade={() => {
                      if (!session) {
                        setShowGuestModal(true)
                      } else {
                        setPremiumTrigger('recording')
                        setShowPremiumModal(true)
                      }
                    }}
                    isInfiniteMode={isInfiniteMode}
                    onToggleInfiniteMode={() => {
                      const newState = !isInfiniteMode
                      setIsInfiniteMode(newState)
                      if (newState) {
                        toast('Practice Mode Enabled (No Recording)', {
                          icon: '♾️',
                          duration: 2000,
                        })
                      } else {
                        toast('Recording Mode Enabled', {
                          icon: '🔴',
                          duration: 2000,
                        })
                      }
                    }}
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

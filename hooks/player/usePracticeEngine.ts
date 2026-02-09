import { useEffect, useCallback, useRef, useState } from 'react'
import { usePlayerState } from './usePlayerState'
import { useAudioSync } from './useAudioSync'
import { useBeatPlayer } from '@/hooks/useBeatPlayer'
import { useRecording } from '@/hooks/useRecording'
import { usePracticeSession } from '@/contexts/SessionContext'
import { useTTS } from '@/hooks/useTTS'
import { Beat } from '@/types/database'
import { WordGenerator } from '@/lib/words/generator'
import { countSyllables, getDifficultyFromSyllables } from '@/lib/words/utils'

/**
 * usePracticeEngine
 *
 * The "Brain" of the Practice Mode.
 * Orchestrates: State Machine <-> Audio Audio <-> Recording <-> Word Prompts <-> Audio Mixing
 */

import { AudioMixer } from '@/lib/audio/mixer'

const ACTIVE_SESSION_STATUSES = new Set([
  'COUNTDOWN',
  'PLAYING',
  'PAUSED',
  'FINISHING',
  'MIXING',
  'SAVING',
])

const FALLBACK_WORDS = [
  'Flow',
  'Rhythm',
  'Power',
  'Spirit',
  'Vision',
  'Create',
  'Inspire',
  'Energy',
  'Focus',
  'Elevate',
  'Master',
  'Legend',
  'Hustle',
  'Grind',
]

/**
 * Configuration properties for the Practice Engine.
 */
interface UsePracticeEngineProps {
  /** The list of beats available for the session */
  initialBeats: Beat[]
  /** The pool of words to be used for generation */
  initialWords: string[]
  /**
   * Frequency of word changes.
   * Represents "Bars per Word".
   * - 1 = Fast (New word every bar)
   * - 4 = Slow (New word every 4 bars)
   */
  frequency: number
  /** Difficulty level of the session (1-5) */
  difficulty: number
  /**
   * Callback to submit the finalized session data.
   * Injected to keep the engine decoupled from network logic.
   */
  submitSession: (formData: FormData) => Promise<unknown>
  /** Session Mode */
  mode?: 'solo' | 'cypher'
  /** Number of players for Cypher mode (2-4) */
  cypherPlayers?: number
  /** Whether recording is enabled for this run */
  isRecordingEnabled?: boolean
  /** Whether completed sessions should be persisted via API */
  shouldSaveSessions?: boolean
}

/**
 * The Core Practice Engine Hook.
 *
 * Acts as the centralized controller for the Practice Mode, orchestrating:
 * 1. **State Management**: Finite State Machine (IDLE -> COUNTDOWN -> PLAYING -> FINISHING).
 * 2. **Audio Sync**: Precise timing via `useAudioSync`.
 * 3. **Word Generation**: Deterministic word prompting based on musical timing.
 * 4. **Recording**: managing the microphone input and blob creation.
 *
 * @param props - Configuration options {@link UsePracticeEngineProps}
 * @returns The engine state and control methods.
 */
export function usePracticeEngine({
  initialBeats: _initialBeats,
  initialWords,
  frequency,
  difficulty,
  submitSession,
  mode = 'solo',
  cypherPlayers = 4,
  isRecordingEnabled = false,
  shouldSaveSessions = true,
}: UsePracticeEngineProps) {
  const isAudioDebug =
    process.env.NODE_ENV !== 'production' &&
    process.env.NEXT_PUBLIC_AUDIO_DEBUG === 'true'

  const debugLog = useCallback(
    (...args: unknown[]) => {
      if (isAudioDebug) {
        console.log(...args)
      }
    },
    [isAudioDebug]
  )

  // 1. The Reducer (State Machine)
  const { state, dispatch } = usePlayerState()

  // 2. The Sub-Systems
  const beatPlayer = useBeatPlayer()
  const recorder = useRecording()
  const latestStatusRef = useRef(state.status)
  const beatPlayerRef = useRef(beatPlayer)
  const recorderRef = useRef(recorder)

  // 0. SAFETY NET: Cleanup on unmount
  useEffect(() => {
    latestStatusRef.current = state.status
  }, [state.status])

  useEffect(() => {
    beatPlayerRef.current = beatPlayer
  }, [beatPlayer])

  useEffect(() => {
    recorderRef.current = recorder
  }, [recorder])

  useEffect(() => {
    return () => {
      // If we unmount while playing (e.g. Navigation), stop everything.
      const status = latestStatusRef.current
      if (status !== 'IDLE' && status !== 'COMPLETED') {
        beatPlayerRef.current.stop()
        if (recorderRef.current.isRecording) {
          recorderRef.current.stop()
        }
      }
    }
  }, [])

  // 3. Audio Clock (The Heartbeat)
  // Word Management State
  const [currentWord, setCurrentWord] = useState<string>('')
  const [activePlayer, setActivePlayer] = useState(1) // Cypher Mode State
  const [startTime, setStartTime] = useState(0)
  const [wordTiming, setWordTiming] = useState<{
    start: number
    duration: number
  }>({ start: 0, duration: 0 })
  const wordGeneratorRef = useRef<WordGenerator | null>(null)
  const fallbackWordPoolRef = useRef<string[]>(FALLBACK_WORDS)
  const wordsUsedRef = useRef<string[]>([])
  const [activeDifficulty, setActiveDifficulty] = useState(difficulty)
  const activeDifficultyRef = useRef(difficulty)
  const pendingDifficultyRef = useRef<number | null>(null)
  const [activeFrequency, setActiveFrequency] = useState(frequency)
  const activeFrequencyRef = useRef(frequency)
  const pendingFrequencyRef = useRef<number | null>(null)

  // Initialize Generator
  useEffect(() => {
    let wordsToUse = initialWords || []

    // SAFETY FALLBACK: If DB returns empty (or fetch failed), use local backup
    if (wordsToUse.length === 0) {
      console.warn('[PracticeEngine] No words provided, using fallback list.')
      wordsToUse = FALLBACK_WORDS
    }
    fallbackWordPoolRef.current = wordsToUse

    // Map string[] to WordData[] structure expected by generator
    const mockWordData = wordsToUse.map((w, i) => {
      const syllables = countSyllables(w)
      const diff = getDifficultyFromSyllables(syllables)
      return {
        wordText: w,
        difficulty: diff,
        id: String(i),
        syllableCount: syllables,
        difficultyLevel: diff,
      }
    })

    wordGeneratorRef.current = new WordGenerator(mockWordData)

    // Config Generator
    const initialDifficulty =
      pendingDifficultyRef.current ?? activeDifficultyRef.current
    wordGeneratorRef.current.setDifficulty(initialDifficulty)
    pendingDifficultyRef.current = null
    activeDifficultyRef.current = initialDifficulty
    setActiveDifficulty(initialDifficulty)

    // Preload first word
    const first = wordGeneratorRef.current.getRandomWord()
    if (first) {
      setCurrentWord(first.wordText)
    } else {
      setCurrentWord(fallbackWordPoolRef.current[0] || FALLBACK_WORDS[0])
    }
  }, [initialWords])

  useEffect(() => {
    const generator = wordGeneratorRef.current
    if (!generator) return

    if (difficulty === activeDifficultyRef.current) {
      return
    }

    if (ACTIVE_SESSION_STATUSES.has(state.status)) {
      pendingDifficultyRef.current = difficulty
      return
    }

    generator.setDifficulty(difficulty)
    pendingDifficultyRef.current = null
    activeDifficultyRef.current = difficulty
    setActiveDifficulty(difficulty)

    const next = generator.getRandomWord()
    if (next) {
      setCurrentWord(next.wordText)
    }
  }, [difficulty, state.status])

  useEffect(() => {
    if (frequency === activeFrequencyRef.current) {
      return
    }

    if (ACTIVE_SESSION_STATUSES.has(state.status)) {
      pendingFrequencyRef.current = frequency
      return
    }

    pendingFrequencyRef.current = null
    activeFrequencyRef.current = frequency
    setActiveFrequency(frequency)
  }, [frequency, state.status])

  // TTS Integration (Restored)
  // TTS Integration (Restored & Upgraded)
  const {
    isTTSEnabled,
    ttsVolume,
    beatVolume,
    isStudioFXEnabled,
    startSession: markSessionActive,
    stopSession: markSessionInactive,
  } = usePracticeSession()
  const { speak } = useTTS({
    enabled: isTTSEnabled,
    volume: ttsVolume,
    rate: 1.0,
    pitch: 1.0,
  })

  useEffect(() => {
    if (currentWord && state.status === 'PLAYING') {
      speak(currentWord)
    }
  }, [currentWord, speak, state.status])

  const trackWordUsage = useCallback((word: string) => {
    const trimmed = word.trim()
    if (!trimmed) return
    wordsUsedRef.current.push(trimmed)
  }, [])

  const getFallbackWord = useCallback(() => {
    const pool = fallbackWordPoolRef.current
    if (!pool.length) {
      return FALLBACK_WORDS[0]
    }
    const index = Math.floor(Math.random() * pool.length)
    return pool[index] || FALLBACK_WORDS[0]
  }, [])

  // Memoize onBeat to prevent useAudioSync restarts
  const onBeat = useCallback(
    (beatIndex: number, time: number) => {
      // EVENT DRIVEN WORD LOGIC
      // Frequency = Bars per Word. 1 Bar = 4 Beats.
      const beatsPerWord = 4 * (activeFrequencyRef.current || 4)

      if (beatIndex % beatsPerWord === 0) {
        const pendingDifficulty = pendingDifficultyRef.current
        if (
          pendingDifficulty !== null &&
          pendingDifficulty !== activeDifficultyRef.current &&
          wordGeneratorRef.current
        ) {
          wordGeneratorRef.current.setDifficulty(pendingDifficulty)
          pendingDifficultyRef.current = null
          activeDifficultyRef.current = pendingDifficulty
          setActiveDifficulty(pendingDifficulty)
        }

        const pendingFrequency = pendingFrequencyRef.current
        if (
          pendingFrequency !== null &&
          pendingFrequency !== activeFrequencyRef.current
        ) {
          activeFrequencyRef.current = pendingFrequency
          pendingFrequencyRef.current = null
          setActiveFrequency(pendingFrequency)
        }

        const effectiveFrequency = activeFrequencyRef.current || 4

        // Trigger Word Change
        // We use the time passed from audio scheduler for precise future timing
        const duration =
          4 * effectiveFrequency * (60 / (beatPlayer.currentBeat?.bpm || 90))

        // Update State (in valid React way)
        const nextWord =
          wordGeneratorRef.current?.getRandomWord()?.wordText ??
          getFallbackWord()
        if (nextWord) {
          setCurrentWord(nextWord)
          setWordTiming({ start: time, duration })
          trackWordUsage(nextWord)

          // Cypher Mode Rotation
          if (mode === 'cypher' && beatIndex > 0) {
            setActivePlayer((prev) => (prev % cypherPlayers) + 1)
          }
        }
      }
    },
    [
      beatPlayer.currentBeat?.bpm,
      mode,
      cypherPlayers,
      trackWordUsage,
      getFallbackWord,
    ]
  )

  const audioSync = useAudioSync({
    bpm: beatPlayer.currentBeat?.bpm || 90,
    isPlaying: state.status === 'PLAYING' && beatPlayer.isPlaying,
    onBeat,
  })
  const { initAudio, audioState } = audioSync

  useEffect(() => {
    const activeStatuses = new Set([
      'COUNTDOWN',
      'PLAYING',
      'PAUSED',
      'FINISHING',
      'MIXING',
      'SAVING',
    ])

    if (activeStatuses.has(state.status)) {
      markSessionActive()
    } else {
      markSessionInactive()
    }
  }, [state.status, markSessionActive, markSessionInactive])

  useEffect(() => {
    if (state.status === 'PLAYING' && !beatPlayer.isPlaying) {
      dispatch({ type: 'PAUSE' })
      if (isRecordingEnabled) {
        recorder.pause()
      }
    }
  }, [
    state.status,
    beatPlayer.isPlaying,
    dispatch,
    isRecordingEnabled,
    recorder,
  ])

  const startSession = useCallback(async () => {
    // Only allowed from IDLE
    if (state.status !== 'IDLE' && state.status !== 'COMPLETED') return

    try {
      wordsUsedRef.current = []
      setActivePlayer(1)
      setWordTiming({ start: 0, duration: 0 })

      // 1. Prime Audio Engine - ATOMIC START
      // The "Forever Fix": Unify AudioContext and HTMLAudioElement
      // This MUST happen in the user-initiated event loop.
      const ctx = initAudio()

      // A. Ensure Master Clock is Running
      if (ctx) {
        if (ctx.state === 'suspended') {
          await ctx.resume()
        }

        // B. Bridge the Track (Prevent independent failures)
        beatPlayer.connectTo(ctx)
      }

      // C. Prime the Element (Unlock Autoplay)
      await beatPlayer.prime()

      // D. Sync Volume (Crucial Fix)
      beatPlayer.setVolume(beatVolume)

      // E. Debug Context State
      if (ctx?.state !== 'running') {
        console.warn(
          '[PracticeEngine] AudioContext is not running:',
          ctx?.state
        )
      } else {
        debugLog('[PracticeEngine] AudioContext Verified: RUNNING')
      }

      // 2. Enter Countdown (Only if Audio is confirmed ready)
      dispatch({ type: 'START' })
    } catch (err) {
      console.error('[PracticeEngine] Start failed:', err)
      // Optional: Dispatch error state if we had a persistent error banner
      // dispatch({ type: 'ERROR', error: 'Failed to initialize audio' })
      alert('Could not start audio engine. Please tap again.')
    }
  }, [state.status, dispatch, initAudio, beatPlayer, beatVolume, debugLog])

  const stopSession = useCallback(() => {
    dispatch({ type: 'STOP', shouldSave: shouldSaveSessions })
    // [COMMAND-BASED] Immediate Stop
    beatPlayer.stop()
    if (isRecordingEnabled) {
      recorder.stop()
    }
  }, [dispatch, beatPlayer, recorder, isRecordingEnabled, shouldSaveSessions])

  const discardSession = useCallback(() => {
    if (confirm('Discard this session?')) {
      dispatch({ type: 'DISCARD' })
      // [COMMAND-BASED] Immediate Stop
      beatPlayer.stop()
      if (isRecordingEnabled) {
        recorder.stop()
      }
    }
  }, [dispatch, beatPlayer, recorder, isRecordingEnabled])

  const togglePause = useCallback(async () => {
    if (state.status === 'PLAYING') {
      dispatch({ type: 'PAUSE' })
      // [COMMAND-BASED] Immediate Pause
      beatPlayer.pause()
      if (isRecordingEnabled) {
        recorder.pause()
      }
    } else if (state.status === 'PAUSED') {
      // [COMMAND-BASED] Resume only if playback truly restarted.
      const resumed = await beatPlayer.play()
      if (!resumed) {
        alert('Could not resume playback. Please try again.')
        return
      }
      dispatch({ type: 'RESUME' })
      if (isRecordingEnabled) {
        recorder.resume()
      }
    }
  }, [state.status, dispatch, beatPlayer, recorder, isRecordingEnabled])

  // 5. Reactive Side Effects (The Muscles)
  // This is where "StateMachine -> Real World" happens.

  // Effect: Handle COUNTDOWN -> PLAYING transition
  // We explicitly trigger the "Drop" here to ensure tight timing.
  const completeCountdown = useCallback(async () => {
    // [COMMAND-BASED] Start "The Drop" before entering PLAYING state.
    beatPlayer.setLoop(true)
    const started = await beatPlayer.play()

    if (!started) {
      beatPlayer.stop()
      dispatch({ type: 'RESET' })
      alert('Could not start playback. Please try again.')
      return
    }

    dispatch({ type: 'COUNTDOWN_COMPLETE' })
    setStartTime(audioSync.getPreciseTime())
    if (isRecordingEnabled) {
      recorder.start().catch((err) => {
        console.error('[PracticeEngine] Recorder start failed:', err)
      })
    }
  }, [dispatch, beatPlayer, recorder, audioSync, isRecordingEnabled])

  // REMOVED: Circular Dependency Effect (was lines 246-267)
  // The logic is now distributed to the commands above.

  // Effect: FINISHING -> SAVING (The Save Flow)
  useEffect(() => {
    if (state.status === 'FINISHING') {
      // Wait for recorder to finalize (it updates duration/blob)
      // This is a tricky sync point.
      // recorder.stop() callback sets blob.
      // We might need to listen to recorder changes.
      // For "Forever Fix", we should probably make start/stop async and await them in the Transition?
      // Or rely on recorder.onComplete callback to dispatch 'START_SAVE'
    }
  }, [state.status])

  // Guarantee non-save paths do not linger in FINISHING.
  useEffect(() => {
    if (state.status === 'FINISHING' && !state.shouldSave) {
      dispatch({ type: 'RESET' })
    }
  }, [state.status, state.shouldSave, dispatch])

  // Guarantee EXITING paths always settle back to IDLE.
  useEffect(() => {
    if (state.status === 'EXITING' && !recorder.isRecording) {
      dispatch({ type: 'RESET' })
    }
  }, [state.status, recorder.isRecording, dispatch])

  // 6. External Recorder Callback Wiring
  // 6. External Recorder Callback Wiring

  const { setOnComplete, setOnMaxDurationReached } = recorder

  useEffect(() => {
    // We overwrite the recorder's onComplete to hook into our FSM
    setOnComplete(async (blob, duration) => {
      // Only proceed if we are in FINISHING state (avoids phantom saves)
      if (
        (state.status === 'FINISHING' || state.status === 'MIXING') &&
        state.shouldSave
      ) {
        // [FIX] Prevent 0-byte uploads (Practice Mode or Microphone Failures)
        if (blob.size === 0) {
          debugLog(
            '[PracticeEngine] Empty blob detected. Skipping upload, saving metadata only.'
          )
          // Redirect to metadata-only flow below
          // We can't easily "jump" to the other if-block, so we execute it here.
          dispatch({ type: 'START_SAVE' })

          const fd = new FormData()
          // No 'audio' file appended

          if (beatPlayer.currentBeat) {
            fd.append('beatId', beatPlayer.currentBeat.id)
            fd.append(
              'title',
              `${beatPlayer.currentBeat.title} - ${new Date().toLocaleDateString()}`
            )
          }
          // Use startTime to calculate duration if recorder duration is 0
          const duration = audioSync.getPreciseTime() - startTime
          fd.append(
            'durationSeconds',
            Math.max(1, Math.round(duration)).toString()
          )
          fd.append('frequency', frequency.toString())
          fd.append('difficulty', difficulty.toString())
          fd.append('score', '0')
          fd.append('wordsUsed', JSON.stringify(wordsUsedRef.current))

          submitSession(fd)
            .then(() => dispatch({ type: 'SAVE_SUCCESS' }))
            .catch((err) =>
              dispatch({
                type: 'SAVE_ERROR',
                error: err instanceof Error ? err.message : 'Unknown error',
              })
            )
          return
        }

        // 1. Enter Mixing State (UI Feedback)
        dispatch({ type: 'START_MIXING' })

        let finalBlob = blob
        let cleanupUrl: string | null = null

        try {
          // 2. Client-Side Mixing
          debugLog('[PracticeEngine] Starting audio mix...')
          const mixer = new AudioMixer()
          const voiceUrl = URL.createObjectURL(blob)
          cleanupUrl = voiceUrl

          // Get User Latency Calibration (Nudge)
          const latencyMs = parseInt(
            localStorage.getItem('flowforge_latency') || '0'
          )

          // Perform Mix
          if (beatPlayer.currentBeat?.storageUrl) {
            finalBlob = await mixer.mix(
              voiceUrl,
              beatPlayer.currentBeat.storageUrl,
              {
                voiceVolume: 1.0, // Vocals always max (normalized)
                beatVolume: beatVolume, // User setting
                isStudioMode: isStudioFXEnabled, // User setting
                nudge: latencyMs,
              }
            )
            debugLog(
              `[PracticeEngine] Mix complete. Size: ${finalBlob.size} bytes`
            )
          } else {
            console.warn('[PracticeEngine] No beat URL found, skipping mix.')
          }
        } catch (mixErr) {
          console.error(
            '[PracticeEngine] Mixing failed, using raw vocal:',
            mixErr
          )
          // Fallback to raw blob is automatic since finalBlob = blob initially
        } finally {
          if (cleanupUrl) URL.revokeObjectURL(cleanupUrl)
        }

        // 3. Begin Upload
        dispatch({ type: 'START_SAVE' })

        // Construct FormData using Ref to avoid closure staleness if needed,
        // but since we depend on context props, we can access them directly if they are passed in.
        // Ideally, we move FormData construction to a helper or do it here.

        try {
          const fd = new FormData()
          fd.append('audio', finalBlob, 'recording.wav') // Note: Mixer returns WAV

          // We need current session state.
          // Since we don't have access to Session contexts directly here (we are a hook),
          // we rely on the props passed to usePracticeEngine.
          // NOTE: The consumer (PracticeClient) must ensure these props are fresh.
          if (beatPlayer.currentBeat) {
            fd.append('beatId', beatPlayer.currentBeat.id)
            fd.append(
              'title',
              `${beatPlayer.currentBeat.title} - ${new Date().toLocaleDateString()}`
            )
          }
          fd.append(
            'durationSeconds',
            Math.max(1, Math.round(duration)).toString()
          )
          fd.append('frequency', frequency.toString()) // Default fallback, should be prop
          fd.append('difficulty', difficulty.toString()) // Default fallback, should be prop
          fd.append('score', '0')
          fd.append('vibe', 'Freestyle Flow')
          fd.append('wordsUsed', JSON.stringify(wordsUsedRef.current))

          // [LATENCY FIX] Inject beatOffsetMs from localStorage
          const latencyMs = parseInt(
            localStorage.getItem('flowforge_latency') || '0'
          )
          fd.append('beatOffsetMs', latencyMs.toString())

          // Execute Save
          submitSession(fd)
            .then(() => dispatch({ type: 'SAVE_SUCCESS' }))
            .catch((err: unknown) =>
              dispatch({
                type: 'SAVE_ERROR',
                error: err instanceof Error ? err.message : 'Unknown error',
              })
            )
        } catch (e: unknown) {
          dispatch({
            type: 'SAVE_ERROR',
            error: e instanceof Error ? e.message : 'Unknown error',
          })
        }
      } else if (state.status === 'EXITING' || !state.shouldSave) {
        // Just reset
        dispatch({ type: 'RESET' })
      }
    })

    // Handle Metadata-Only Saves (No Recording)
    // This triggers if recording was disabled or failed to start
    if (
      state.status === 'FINISHING' &&
      state.shouldSave &&
      !recorder.isRecording && // Not recording now
      recorder.duration === 0 // And didn't record anything
    ) {
      debugLog(
        '[PracticeEngine] No recording detected. Submitting metadata only.'
      )
      dispatch({ type: 'START_SAVE' })

      const fd = new FormData()
      // No 'audio' file appended

      if (beatPlayer.currentBeat) {
        fd.append('beatId', beatPlayer.currentBeat.id)
        fd.append(
          'title',
          `${beatPlayer.currentBeat.title} - ${new Date().toLocaleDateString()}`
        )
      }
      // Use startTime to calculate duration if recorder duration is 0
      const duration = audioSync.getPreciseTime() - startTime
      fd.append('durationSeconds', Math.max(1, Math.round(duration)).toString())
      fd.append('frequency', frequency.toString())
      fd.append('difficulty', difficulty.toString())
      fd.append('score', '0')
      fd.append('wordsUsed', JSON.stringify(wordsUsedRef.current))

      submitSession(fd)
        .then(() => dispatch({ type: 'SAVE_SUCCESS' }))
        .catch((err) =>
          dispatch({
            type: 'SAVE_ERROR',
            error: err instanceof Error ? err.message : 'Unknown error',
          })
        )
    }

    // Wire up Max Duration (Premium/Guest Limits)
    if (isRecordingEnabled) {
      setOnMaxDurationReached(() => {
        // Stop everything
        stopSession()
      })
    }
  }, [
    state.status,
    state.shouldSave,
    // recorder, // Removed unstable object dependency
    setOnComplete, // Stable action
    setOnMaxDurationReached, // Stable action
    submitSession,
    dispatch,
    beatPlayer.currentBeat,
    stopSession,
    difficulty,
    frequency,
    beatVolume, // Added dependency
    isStudioFXEnabled,
    audioSync,
    recorder.duration,
    recorder.isRecording,
    startTime,
    isRecordingEnabled,
    debugLog,
  ])

  // 7. Live Volume Sync (The Missing Link)
  useEffect(() => {
    if (beatPlayer) {
      beatPlayer.setVolume(beatVolume)
    }
  }, [beatVolume, beatPlayer])

  return {
    // State
    status: state.status,
    isGuest: state.isGuest,
    error: state.error,
    audioState,

    // Actions
    startSession,
    stopSession,
    discardSession,
    togglePause,
    completeCountdown,

    // Child Hooks (Exposed for UI binding if needed, or wrapped)
    beatPlayer,
    recorder,

    // Word Data
    currentWord,
    wordTiming,
    activePlayer,
    activeDifficulty,
    activeFrequency,

    // Time Logic (Monotonic)
    startTime,
    getAudioTime: audioSync.getPreciseTime,
  }
}

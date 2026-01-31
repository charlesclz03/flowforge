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
 * Orchestrates: State Machine <-> Audio Audio <-> Recording <-> Word Prompts
 */

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
  submitSession: (formData: FormData) => Promise<any>
  /** Session Mode */
  mode?: 'solo' | 'cypher'
  /** Number of players for Cypher mode (2-4) */
  cypherPlayers?: number
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
}: UsePracticeEngineProps) {
  // 1. The Reducer (State Machine)
  const { state, dispatch } = usePlayerState()

  // 2. The Sub-Systems
  const beatPlayer = useBeatPlayer()
  const recorder = useRecording()

  // 3. Audio Clock (The Heartbeat)
  // Word Management State
  const [currentWord, setCurrentWord] = useState<string>('')
  const [activePlayer, setActivePlayer] = useState(1) // Cypher Mode State
  const [wordTiming, setWordTiming] = useState<{
    start: number
    duration: number
  }>({ start: 0, duration: 0 })
  const wordGeneratorRef = useRef<WordGenerator | null>(null)

  // Initialize Generator
  useEffect(() => {
    let wordsToUse = initialWords || []

    // SAFETY FALLBACK: If DB returns empty (or fetch failed), use local backup
    if (wordsToUse.length === 0) {
      console.warn('[PracticeEngine] No words provided, using fallback list.')
      wordsToUse = [
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
    }

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
    if (wordGeneratorRef.current) {
      wordGeneratorRef.current.setDifficulty(difficulty)
    }

    // Preload first word
    const first = wordGeneratorRef.current.getRandomWord()
    if (first) setCurrentWord(first.wordText)
  }, [initialWords, difficulty]) // Added difficulty dependency to re-init if needed, though usually dynamic

  // TTS Integration (Restored)
  // TTS Integration (Restored & Upgraded)
  const { isTTSEnabled, ttsVolume } = usePracticeSession()
  const { speak } = useTTS({
    enabled: isTTSEnabled,
    volume: ttsVolume,
    rate: 1.0,
    pitch: 1.0,
  })

  useEffect(() => {
    if (currentWord) {
      speak(currentWord)
    }
  }, [currentWord, speak])

  // Refs for audio callback access
  const frequencyRef = useRef(frequency)
  useEffect(() => {
    frequencyRef.current = frequency
  }, [frequency])

  // Memoize onBeat to prevent useAudioSync restarts
  const onBeat = useCallback(
    (beatIndex: number, time: number) => {
      // EVENT DRIVEN WORD LOGIC
      // Frequency = Bars per Word. 1 Bar = 4 Beats.
      const beatsPerWord = 4 * (frequencyRef.current || 4)

      if (beatIndex % beatsPerWord === 0) {
        // Trigger Word Change
        // We use the time passed from audio scheduler for precise future timing
        const duration =
          beatsPerWord * (60 / (beatPlayer.currentBeat?.bpm || 90))

        // Update State (in valid React way)
        const next = wordGeneratorRef.current?.getRandomWord()
        if (next) {
          setCurrentWord(next.wordText)
          setWordTiming({ start: time, duration })

          // Cypher Mode Rotation
          if (mode === 'cypher') {
            setActivePlayer((prev) => (prev % cypherPlayers) + 1)
          }
        }
      }
    },
    [beatPlayer.currentBeat?.bpm, mode, cypherPlayers]
  )

  const { initAudio, audioState } = useAudioSync({
    bpm: beatPlayer.currentBeat?.bpm || 90,
    isPlaying: state.status === 'PLAYING',
    onBeat,
  })

  const startSession = useCallback(async () => {
    // Only allowed from IDLE
    if (state.status !== 'IDLE' && state.status !== 'COMPLETED') return

    // 1. Prime Audio Engine (Mobile fix)
    const ctx = initAudio()
    if (ctx?.state === 'suspended') {
      try {
        await ctx.resume()
      } catch (e) {
        console.warn('Manual resume failed', e)
      }
    }

    beatPlayer.prime()

    // 2. Enter Countdown
    dispatch({ type: 'START' })
  }, [state.status, dispatch, initAudio, beatPlayer])

  const stopSession = useCallback(() => {
    dispatch({ type: 'STOP', shouldSave: true })
    // [COMMAND-BASED] Immediate Stop
    beatPlayer.stop()
    recorder.stop()
  }, [dispatch, beatPlayer, recorder])

  const discardSession = useCallback(() => {
    if (confirm('Discard this session?')) {
      dispatch({ type: 'DISCARD' })
      // [COMMAND-BASED] Immediate Stop
      beatPlayer.stop()
      recorder.stop()
    }
  }, [dispatch, beatPlayer, recorder])

  const togglePause = useCallback(() => {
    if (state.status === 'PLAYING') {
      dispatch({ type: 'PAUSE' })
      // [COMMAND-BASED] Immediate Pause
      beatPlayer.pause()
      recorder.pause()
    } else if (state.status === 'PAUSED') {
      dispatch({ type: 'RESUME' })
      // [COMMAND-BASED] Immediate Resume
      beatPlayer.play()
      recorder.resume()
    }
  }, [state.status, dispatch, beatPlayer, recorder])

  // 5. Reactive Side Effects (The Muscles)
  // This is where "StateMachine -> Real World" happens.

  // Effect: Handle COUNTDOWN -> PLAYING transition
  // We explicitly trigger the "Drop" here to ensure tight timing.
  const completeCountdown = useCallback(() => {
    dispatch({ type: 'COUNTDOWN_COMPLETE' })
    // [COMMAND-BASED] Immediate Start "The Drop"
    beatPlayer.play()
    recorder.start()
  }, [dispatch, beatPlayer, recorder])

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

  // 6. External Recorder Callback Wiring
  // 6. External Recorder Callback Wiring

  const { setOnComplete, setOnMaxDurationReached } = recorder

  useEffect(() => {
    // We overwrite the recorder's onComplete to hook into our FSM
    setOnComplete((blob, duration) => {
      // Only proceed if we are in FINISHING state (avoids phantom saves)
      if (state.status === 'FINISHING' && state.shouldSave) {
        dispatch({ type: 'START_SAVE' })

        // Construct FormData using Ref to avoid closure staleness if needed,
        // but since we depend on context props, we can access them directly if they are passed in.
        // Ideally, we move FormData construction to a helper or do it here.

        try {
          const fd = new FormData()
          fd.append('audio', blob, 'recording.webm')

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
          // We need wordsUsed. Engine should probably track this or accept a getter.
          fd.append('wordsUsed', '[]')

          // [LATENCY FIX] Inject beatOffsetMs from localStorage
          const latencyMs = parseInt(
            localStorage.getItem('flowforge_latency') || '0'
          )
          fd.append('beatOffsetMs', latencyMs.toString())

          // Execute Save
          submitSession(fd)
            .then(() => dispatch({ type: 'SAVE_SUCCESS' }))
            .catch((err) =>
              dispatch({ type: 'SAVE_ERROR', error: err.message })
            )
        } catch (e: any) {
          dispatch({ type: 'SAVE_ERROR', error: e.message })
        }
      } else if (state.status === 'EXITING' || !state.shouldSave) {
        // Just reset
        dispatch({ type: 'RESET' })
      }
    })

    // Wire up Max Duration (Premium/Guest Limits)
    setOnMaxDurationReached(() => {
      // Stop everything
      stopSession()
    })
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
  ])

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
    // Word Data
    currentWord,
    wordTiming,
    activePlayer,
  }
}

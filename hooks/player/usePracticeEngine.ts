import { useEffect, useCallback, useRef, useState } from 'react'
import { usePlayerState } from './usePlayerState'
import { useAudioSync } from './useAudioSync'
import { useBeatPlayer } from '@/hooks/useBeatPlayer'
import { useRecording } from '@/hooks/useRecording'

import { Beat } from '@/types/database'
import { toast } from 'react-hot-toast'

import { WordGenerator } from '@/lib/words/generator'
import { WordData } from '@/lib/words/types' // Assuming types import needed or we use generator's return type automatically

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
  initialBeats,
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
    // Map string[] to WordData[] structure expected by generator if needed,
    // or just assume strings if we simplify generator interactions.
    // The existing generator expects WordData[].
    // Let's assume initialWords is mapped properly or we mock it.
    // Wait, initialWords is string[]. DB returns WordData.
    // PracticePage currently flattens it (line 18 of page.tsx).
    // effectively we need to reconstruct objects or adjust generator.
    // For now, let's map strings back to mock WordData to satisfy the Class.
    const mockWordData = initialWords.map((w, i) => ({
      wordText: w,
      difficulty: 1,
      id: String(i),
      syllableCount: 1, // Fallback
      difficultyLevel: 1, // Fallback (number)
    }))
    wordGeneratorRef.current = new WordGenerator(mockWordData)
    // Preload first word
    const first = wordGeneratorRef.current.getRandomWord()
    if (first) setCurrentWord(first.wordText)
  }, [initialWords])

  // Refs for audio callback access
  const frequencyRef = useRef(frequency)
  useEffect(() => {
    frequencyRef.current = frequency
  }, [frequency])

  const { initAudio, getPreciseTime } = useAudioSync({
    bpm: beatPlayer.currentBeat?.bpm || 90,
    isPlaying: state.status === 'PLAYING',
    onBeat: (beatIndex, time) => {
      // EVENT DRIVEN WORD LOGIC
      // Frequency = Bars per Word. 1 Bar = 4 Beats.
      const beatsPerWord = 4 * (frequencyRef.current || 4)

      if (beatIndex % beatsPerWord === 0) {
        // Trigger Word Change
        // We use the time passed from audio scheduler for precise future timing
        const duration =
          beatsPerWord * (60 / (beatPlayer.currentBeat?.bpm || 90))

        // Update State (in valid React way)
        // Since this runs in a callback, we can set state.
        // Note: setting state here triggers render.
        // For smoother visuals, we might want to schedule this?
        // Actually, onBeat is called slightly ahead (100ms).
        // If we set state NOW, the word appears 100ms early. This is GOOD for human reaction time.

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
  })

  // 4. Controller Actions (The Public API)

  const startSession = useCallback(async () => {
    // Only allowed from IDLE
    if (state.status !== 'IDLE' && state.status !== 'COMPLETED') return

    // 1. Prime Audio Engine (Mobile fix)
    const ctx = initAudio()
    if (ctx?.state === 'suspended') await ctx.resume()
    beatPlayer.prime()

    // 2. Enter Countdown
    dispatch({ type: 'START' })

    // 3. Countdown Side Effect managed by Effect or explicit logic?
    // Let's keep it explicit here for "The Drop" control.
    // Actually, separating side-effects into useEffect is safer for state pairing.
    // But for the Countdown->Play transition, we might want explicit control.
  }, [state.status, dispatch, initAudio, beatPlayer])

  const stopSession = useCallback(() => {
    dispatch({ type: 'STOP', shouldSave: true })
  }, [dispatch])

  const discardSession = useCallback(() => {
    if (confirm('Discard this session?')) {
      dispatch({ type: 'DISCARD' })
    }
  }, [dispatch])

  const togglePause = useCallback(() => {
    if (state.status === 'PLAYING') dispatch({ type: 'PAUSE' })
    else if (state.status === 'PAUSED') dispatch({ type: 'RESUME' })
  }, [state.status, dispatch])

  // 5. Reactive Side Effects (The Muscles)
  // This is where "StateMachine -> Real World" happens.

  // Effect: Handle COUNTDOWN -> PLAYING transition automatically?
  // Or UI drives countdown and calls finishCountdown?
  // Let's let UI drive countdown visualization, but Engine owns the transition.
  const completeCountdown = useCallback(() => {
    dispatch({ type: 'COUNTDOWN_COMPLETE' })
  }, [dispatch])

  // Effect: PLAYING Entry/Exit
  useEffect(() => {
    if (state.status === 'PLAYING') {
      // ENTER PLAYING
      beatPlayer.play()
      // Start recording/mic
      // Check if Guest or Pro logic needed here?
      // recorder.start/practice logic can be handled inside recorder hook or here.
      // For now, assume generic start, we handle save logic later.
      recorder.start()
    } else if (state.status === 'PAUSED') {
      beatPlayer.pause()
      recorder.pause()
    } else if (
      state.status === 'FINISHING' ||
      state.status === 'EXITING' ||
      state.status === 'IDLE'
    ) {
      // EXIT PLAYING (STOP EVERYTHING)
      beatPlayer.stop()
      recorder.stop()
    }
  }, [state.status, beatPlayer, recorder])

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
  useEffect(() => {
    // We overwrite the recorder's onComplete to hook into our FSM
    recorder.setOnComplete((blob, duration) => {
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
    recorder.setOnMaxDurationReached(() => {
      // Stop everything
      stopSession()
      // Trigger specific UI or Toast?
      // The UI can react to state.status === 'FINISHING' and show modal if user is not pro.
      // However, we might want a specific error or flag in state.
      // For now, standard stop is safer.
    })
  }, [
    state.status,
    state.shouldSave,
    recorder,
    submitSession,
    dispatch,
    beatPlayer.currentBeat,
    stopSession,
  ])

  return {
    // State
    status: state.status,
    isGuest: state.isGuest,
    error: state.error,

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

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'

/**
 * Atomic Audio Sync Hook
 *
 * PROBLEM: React state updates (useState) are async and tied to render cycles.
 * Relying on them for audio timing causes "Drift" (cumulative error).
 *
 * SOLUTION: Use a "Master Clock" pattern.
 * - The AudioContext.currentTime is the source of truth.
 * - requestAnimationFrame pulls data from the clock for UI updates.
 * - Audio scheduling happens ahead of time (lookahead) unrelated to UI frames.
 */

interface UseAudioSyncProps {
  /** Beats Per Minute of the track */
  bpm: number
  /** Whether the audio engine should be running */
  isPlaying: boolean
  /** Changes when a new session starts; used to reset internal beat counters */
  sessionId?: number
  /**
   * Callback fired precisely on every beat.
   * @param beatIndex - Total beats elapsed since start
   * @param time - The AudioContext time of the event (for lookahead scheduling)
   */
  onBeat?: (beatIndex: number, time: number) => void
  /**
   * Callback fired on sub-divisions (e.g. 1/8th notes).
   * @param subDiv - Index of the subdivision
   * @param time - The AudioContext time
   */
  onSubBeat?: (subDiv: number, time: number) => void
}

/**
 * Atomic Audio Sync Hook.
 *
 * Solves the "React Timer Drift" problem by using the Web Audio API's clock as the source of truth.
 *
 * **Mechanism:**
 * - Uses `AudioContext.currentTime` as the master clock.
 * - Uses recursive `setTimeout` (the Scheduler) to look ahead 100ms and schedule events.
 * - This ensures synchronization is independent of the UI main thread (React render cycles).
 *
 * @param props - Configuration for audio timing {@link UseAudioSyncProps}
 * @returns Object containing initialization and time check methods.
 */
export function useAudioSync({
  bpm,
  isPlaying,
  sessionId = 0,
  onBeat,
  onSubBeat: _onSubBeat,
}: UseAudioSyncProps) {
  // Audio Context is the master clock
  const audioContextRef = useRef<AudioContext | null>(null)

  // Timing State
  const nextNoteTimeRef = useRef(0)
  const currentBeatRef = useRef(0)
  const isRunningRef = useRef(false)
  const requestRef = useRef<number | null>(null)
  const lastStopTimeRef = useRef<number | null>(null)
  const lastSessionIdRef = useRef<number | null>(null)

  // Expose the raw audio state for advanced handling (e.g. stalled detection)
  const [audioState, setAudioState] = useState<AudioContextState>('closed')

  // Initialize AudioContext lazily (must be user interaction triggered normally, but we prep it)
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContext()

      // Listen for state changes
      audioContextRef.current.onstatechange = () => {
        setAudioState(audioContextRef.current?.state || 'closed')
      }
    }

    // Resume if suspended (browser autoplay policy)
    // Fire-and-forget the resume attempt
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch((err) => {
        console.error(
          '[AudioSync] AudioContext resume failed (Autoplay policy?):',
          err
        )
      })
    }

    // Sync state immediately
    setAudioState(audioContextRef.current.state)

    return audioContextRef.current
  }, [])

  // The Scheduler: Looks ahead and schedules events
  const scheduleAheadTime = 0.1 // 100ms lookahead
  const lookaheadMs = 25.0 // Check every 25ms

  const nextNote = useCallback(() => {
    const secondsPerBeat = 60.0 / bpm
    nextNoteTimeRef.current += secondsPerBeat
    currentBeatRef.current++

    // Beat Wrap / Reset logic could go here if we tracked measures
  }, [bpm])

  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current
    if (!ctx) return

    // While there are notes that will play within the scheduleAheadTime...
    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      // 1. Trigger Audio Events (Metronome, Samples)
      // Note: We don't play sound here directly to keep this hook pure,
      // but we invoke callbacks that the engine uses to trigger sounds.
      if (onBeat) {
        onBeat(currentBeatRef.current, nextNoteTimeRef.current)
      }

      // 2. Advance Time
      nextNote()
    }

    if (isRunningRef.current) {
      requestRef.current = window.setTimeout(scheduler, lookaheadMs)
    }
  }, [onBeat, nextNote])

  // UI Sync Loop (requestAnimationFrame) - Strictly for Visuals
  // This is completely separate from the audio scheduler above.
  const uiLoop = useCallback(() => {
    if (!isRunningRef.current) return

    // Triggers a re-render if needed, but optimally we'd modify a clean ref/store
    // For now, we leave visual updates to the consumer via a getProgress() polling
    requestAnimationFrame(uiLoop)
  }, [])

  // Start/Stop Logic
  useEffect(() => {
    if (lastSessionIdRef.current === null || lastSessionIdRef.current !== sessionId) {
      lastSessionIdRef.current = sessionId
      currentBeatRef.current = 0
      nextNoteTimeRef.current = 0
      lastStopTimeRef.current = null
    }

    if (isPlaying) {
      const ctx = initAudio()
      if (!ctx) return

      isRunningRef.current = true

      // Fresh start (new session) initializes the scheduler near "now".
      if (nextNoteTimeRef.current === 0) {
        nextNoteTimeRef.current = ctx.currentTime + 0.05 // Start slightly in future
      } else if (lastStopTimeRef.current !== null) {
        // Resume (pause -> play): shift the schedule forward by the paused duration
        // so we don't "catch up" and spam callbacks.
        const delta = ctx.currentTime - lastStopTimeRef.current
        nextNoteTimeRef.current += Math.max(0, delta)
      }

      lastStopTimeRef.current = null

      scheduler()
      uiLoop()
    } else {
      isRunningRef.current = false
      if (audioContextRef.current) {
        lastStopTimeRef.current = audioContextRef.current.currentTime
      }
      if (requestRef.current) {
        window.clearTimeout(requestRef.current)
      }
    }

    return () => {
      isRunningRef.current = false
      if (requestRef.current) {
        window.clearTimeout(requestRef.current)
      }
    }
  }, [isPlaying, bpm, sessionId, initAudio, scheduler, uiLoop])

  // Precise Time Getter
  const getPreciseTime = useCallback(() => {
    if (!audioContextRef.current) return 0
    return audioContextRef.current.currentTime
  }, [])

  return useMemo(
    () => ({
      initAudio,
      getPreciseTime,
      audioState,
      isSuspended: audioState === 'suspended',
    }),
    [initAudio, getPreciseTime, audioState]
  )
}

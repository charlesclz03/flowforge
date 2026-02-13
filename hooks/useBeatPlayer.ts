'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { AudioPlayer } from '@/lib/audio/player'
import { BeatMetadata } from '@/lib/beats/types'

export function useBeatPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const playerRef = useRef<AudioPlayer | null>(null)
  const currentBeatRef = useRef<BeatMetadata | null>(null)
  const timeRef = useRef(0)
  const startOffsetRef = useRef(0)

  const normalizeOffset = (offset: number | null | undefined, beatDuration: number) => {
    if (!Number.isFinite(offset ?? NaN)) return 0

    const parsed = Number(offset)
    if (parsed <= 0) return 0

    if (Number.isFinite(beatDuration) && beatDuration > 0) {
      return Math.min(parsed, Math.max(beatDuration - 0.01, 0))
    }

    return parsed
  }

  // Initialize player
  useEffect(() => {
    playerRef.current = new AudioPlayer()

    playerRef.current.onTimeUpdate((time) => {
      timeRef.current = time
      // No longer calling setCurrentTime(time) here to avoid re-renders
    })

    playerRef.current.onEnded(() => {
      setIsPlaying(false)
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [])

  /**
   * Load a beat
   */
  const loadBeat = useCallback(async (beat: BeatMetadata) => {
    if (!playerRef.current) return

    setIsLoading(true)
    setError(null)
    timeRef.current = 0
    setIsPlaying(false) // Reset playing state on load

    try {
      await playerRef.current.load(beat.storageUrl)
      currentBeatRef.current = beat

      const state = playerRef.current.getState()
      const startOffset = normalizeOffset(beat.offset, state.duration)

      startOffsetRef.current = startOffset
      playerRef.current.setLoopStart(startOffset)

      if (startOffset > 0) {
        playerRef.current.seek(startOffset)
        timeRef.current = startOffset
      } else {
        timeRef.current = 0
      }

      setDuration(state.duration)
      setIsLoading(false)
    } catch (err) {
      console.error('Error loading beat:', err)
      startOffsetRef.current = 0
      setError('Failed to load beat')
      setIsLoading(false)
    }
  }, [])

  /**
   * Play the current beat
   */
  const play = useCallback(async (): Promise<boolean> => {
    if (!playerRef.current) return false

    try {
      // Optimistic update
      setIsPlaying(true)
      setError(null)

      const stateBeforePlay = playerRef.current.getState()
      if (
        !stateBeforePlay.isPlaying &&
        stateBeforePlay.currentTime <= 0.05 &&
        startOffsetRef.current > 0
      ) {
        playerRef.current.seek(startOffsetRef.current)
        timeRef.current = startOffsetRef.current
      }

      await playerRef.current.play()

      // Verification after await (plus a short second check for browsers that
      // resolve play() before paused state settles).
      let state = playerRef.current.getState()
      if (!state.isPlaying) {
        await new Promise((resolve) => setTimeout(resolve, 75))
        state = playerRef.current.getState()
      }
      if (!state.isPlaying) {
        console.warn(
          'Play resolved but player is not playing (likely ended immediately or failed silently)'
        )
        setIsPlaying(false)
        return false
      }

      return true
    } catch (err) {
      console.error('Error playing beat:', err)
      setError('Failed to play beat')
      setIsPlaying(false)
      return false
    }
  }, [])

  /**
   * Pause the current beat
   */
  const pause = useCallback(() => {
    if (!playerRef.current) return

    playerRef.current.pause()
    setIsPlaying(false)
  }, [])

  /**
   * Stop the current beat
   */
  const stop = useCallback(() => {
    if (!playerRef.current) return

    playerRef.current.stop()
    setIsPlaying(false)
    setError(null)
    timeRef.current = 0
  }, [])

  /**
   * Toggle play/pause
   */
  const toggle = useCallback(async () => {
    if (isPlaying) {
      pause()
      return true
    } else {
      return play()
    }
  }, [isPlaying, play, pause])

  /**
   * Seek to a specific time
   */
  const seek = useCallback((time: number) => {
    if (!playerRef.current) return

    playerRef.current.seek(time)
    timeRef.current = time
  }, [])

  /**
   * Set volume
   */
  const setVolume = useCallback((volume: number) => {
    if (!playerRef.current) return

    playerRef.current.setVolume(volume)
  }, [])

  /**
   * Enable/disable looping
   */
  const setLoop = useCallback((loop: boolean) => {
    if (!playerRef.current) return

    playerRef.current.setLoop(loop)
  }, [])

  // Memoize the return object to prevent unnecessary re-renders in consumers
  return useMemo(
    () => ({
      // State
      isPlaying,
      currentTime: timeRef.current, // Keep ref access for legacy props
      getPreciseTime: () => {
        // Query the actual audio element for high-precision time (prevents drift)
        return playerRef.current?.getState().currentTime || timeRef.current
      },
      duration,
      isLoading,
      error,
      currentBeat: currentBeatRef.current,

      // Actions
      loadBeat,
      play,
      pause,
      stop,
      toggle,
      seek,
      setVolume,
      setLoop,
      prime: () => playerRef.current?.prime(),
      connectTo: (ctx: AudioContext) => playerRef.current?.connectToContext(ctx),
    }),
    [
      isPlaying,
      duration,
      isLoading,
      error,
      loadBeat,
      play,
      pause,
      stop,
      toggle,
      seek,
      setVolume,
      setLoop,
    ]
  )
}


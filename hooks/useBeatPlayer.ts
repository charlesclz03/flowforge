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

  // Initialize player
  useEffect(() => {
    playerRef.current = new AudioPlayer()

    playerRef.current.onTimeUpdate((time) => {
      timeRef.current = time
      // No longer calling setCurrentTime(time) here to avoid re-renders
    })

    playerRef.current.onEnded(() => {
      console.log('Hook received onEnded')
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
      setDuration(state.duration)
      setIsLoading(false)
    } catch (err) {
      console.error('Error loading beat:', err)
      setError('Failed to load beat')
      setIsLoading(false)
    }
  }, [])

  /**
   * Play the current beat
   */
  const play = useCallback(async () => {
    if (!playerRef.current) return

    try {
      // Optimistic update
      setIsPlaying(true)
      setError(null)

      await playerRef.current.play()

      // Verification after await
      const state = playerRef.current.getState()
      if (!state.isPlaying) {
        console.warn(
          'Play resolved but player is not playing (likely ended immediately or failed silently)'
        )
        setIsPlaying(false)
      }
    } catch (err) {
      console.error('Error playing beat:', err)
      setError('Failed to play beat')
      setIsPlaying(false)
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
    } else {
      await play()
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
      currentTime: timeRef.current, // Keep ref access cheap
      getPreciseTime: () => timeRef.current,
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

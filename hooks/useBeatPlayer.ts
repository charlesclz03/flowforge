'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AudioPlayer } from '@/lib/audio/player'
import { BeatMetadata } from '@/lib/beats/types'

export function useBeatPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const playerRef = useRef<AudioPlayer | null>(null)
  const currentBeatRef = useRef<BeatMetadata | null>(null)

  // Initialize player
  useEffect(() => {
    playerRef.current = new AudioPlayer()

    playerRef.current.onTimeUpdate((time) => {
      setCurrentTime(time)
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
      await playerRef.current.play()
      setIsPlaying(true)
      setError(null)
    } catch (err) {
      console.error('Error playing beat:', err)
      setError('Failed to play beat')
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
    setCurrentTime(0)
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
    setCurrentTime(time)
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

  return {
    // State
    isPlaying,
    currentTime,
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
  }
}


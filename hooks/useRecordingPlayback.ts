import { useState, useEffect, useRef, useCallback } from 'react'
import { SeamlessLooper } from '@/lib/audio/seamless-looper'
import { resolveRecordingSync } from '@/lib/audio/recording-sync'

interface UseRecordingPlaybackProps {
  recordingUrl: string | null
  beatUrl: string | null
  recordingId: string
  beatOffsetMs?: number | null
  fxConfig?: unknown
  onPlayStateChange?: (isPlaying: boolean) => void
}

export function useRecordingPlayback({
  recordingUrl,
  beatUrl,
  recordingId,
  beatOffsetMs,
  fxConfig,
  onPlayStateChange,
}: UseRecordingPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const beatLooperRef = useRef<SeamlessLooper | null>(null)

  // Track if we are currently trying to refresh a link to avoid infinite loops
  const isRetryingRef = useRef(false)
  const onPlayStateChangeRef = useRef(onPlayStateChange)
  const resolvedSyncRef = useRef<{ beatOffsetMs: number; nudgeMs: number }>({
    beatOffsetMs: 0,
    nudgeMs: 0,
  })

  useEffect(() => {
    onPlayStateChangeRef.current = onPlayStateChange
  }, [onPlayStateChange])

  useEffect(() => {
    resolvedSyncRef.current = resolveRecordingSync({ beatOffsetMs, fxConfig })
  }, [beatOffsetMs, fxConfig])

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    if (beatLooperRef.current) {
      beatLooperRef.current.destroy()
      beatLooperRef.current = null
    }
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    // Cleanup on unmount or url change
    return () => {
      cleanup()
    }
  }, [recordingId, cleanup])

  const initializeAudio = useCallback(async () => {
    if (!recordingUrl) return false

    cleanup()
    setIsLoading(true)
    setError(null)

    try {
      // 1. Setup Vocal Track (Standard Audio for streaming/seeking support)
      const audio = new Audio(recordingUrl)
      audioRef.current = audio

      // Apply saved mix settings if present
      if (fxConfig && typeof fxConfig === 'object') {
        const config = fxConfig as Record<string, unknown>
        if (
          typeof config.voiceVolume === 'number' &&
          Number.isFinite(config.voiceVolume)
        ) {
          audio.volume = Math.max(0, Math.min(1, config.voiceVolume))
        }
      }

      // 2. Setup Beat Track (SeamlessLooper for gapless looping)
      if (beatUrl) {
        const looper = new SeamlessLooper()
        // Load beat - this might fail if link is expired/403
        await looper.load(beatUrl)

        let beatVolume = 0.8
        if (fxConfig && typeof fxConfig === 'object') {
          const config = fxConfig as Record<string, unknown>
          if (
            typeof config.beatVolume === 'number' &&
            Number.isFinite(config.beatVolume)
          ) {
            beatVolume = config.beatVolume
          }
        }
        looper.setVolume(beatVolume)
        beatLooperRef.current = looper
      }

      // 3. Attach Event Listeners
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        beatLooperRef.current?.stop()
        onPlayStateChangeRef.current?.(false)
      })

      audio.addEventListener('pause', () => {
        setIsPlaying(false)
        beatLooperRef.current?.pause()
        onPlayStateChangeRef.current?.(false)
      })

      audio.addEventListener('play', () => {
        setIsPlaying(true)
        const sync = resolvedSyncRef.current
        const beatStartTime =
          sync.beatOffsetMs / 1000 + audio.currentTime - sync.nudgeMs / 1000
        if (beatLooperRef.current) {
          beatLooperRef.current.seek(beatStartTime)
          beatLooperRef.current.play()
        }
        onPlayStateChangeRef.current?.(true)
      })

      // Error Handling (The Critical Part)
      audio.addEventListener('error', (e) => {
        console.error('Audio Playback Error:', e)
        const err = audio.error

        // Check for 403/404 based on network behavior or message?
        // HTMLAudioElement error doesn't give status code directly, simple generic code 4 (MEDIA_ERR_SRC_NOT_SUPPORTED) usually for 403

        if (err?.code === 4 && !isRetryingRef.current) {
          setError('Link expired. Refreshing...')
          // We could trigger a router.refresh() here via a callback prop if needed
          // or just let the UI handle the "Retry/Refresh" button
        } else {
          setError('Failed to play recording.')
        }

        setIsPlaying(false)
        onPlayStateChangeRef.current?.(false)
      })

      // Wait for playable?
      // For standard HTML5 audio, we don't strictly need to wait for 'canplay' to call play(),
      // but it's good practice to verify load.
      // However, to keep it snappy, we rely on the error listener.

      setIsLoading(false)
      return true
    } catch (err) {
      console.error('Initialization failed:', err)
      setError('Failed to load audio resources')
      setIsLoading(false)
      return false
    }
  }, [recordingUrl, beatUrl, cleanup])

  const play = useCallback(async () => {
    if (!audioRef.current) {
      const success = await initializeAudio()
      if (!success) return
    }

    // If validation passed
    if (audioRef.current) {
      try {
        await audioRef.current.play()
        // Beat looper starts via the 'play' event listener on audioRef
      } catch (err) {
        console.error('Play failed:', err)
        // Standard play() promise rejection (e.g. user didn't interact)
      }
    }
  }, [initializeAudio])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) pause()
    else play()
  }, [isPlaying, pause, play])

  return {
    isPlaying,
    isLoading,
    error,
    play,
    pause,
    toggle,
  }
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { AudioRecorder } from '@/lib/recording/recorder'
import { RECORDING_CONFIG } from '@/lib/constants/design'
import * as Sentry from '@sentry/nextjs'

interface UseRecordingProps {
  maxDuration?: number | null
  onComplete?: (blob: Blob, duration: number) => void
  onMaxDurationReached?: () => void
}

export function useRecording({
  maxDuration = RECORDING_CONFIG.FREE_TIER_LIMIT_SECONDS,
  onComplete,
  onMaxDurationReached,
}: UseRecordingProps = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  const recorderRef = useRef<AudioRecorder | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize recorder
  useEffect(() => {
    recorderRef.current = new AudioRecorder()

    recorderRef.current.onStop((blob) => {
      setRecordingBlob(blob)
      setIsRecording(false)
      setIsPaused(false)

      const finalDuration = recorderRef.current?.getDuration() || 0
      setDuration(finalDuration)

      if (onComplete) {
        onComplete(blob, finalDuration)
      }
    })

    recorderRef.current.onError((err) => {
      setError(err.message)
      setIsRecording(false)
      setIsPaused(false)

      // Log to Sentry if not a user permission issue
      if (err.name !== 'NotAllowedError' && err.name !== 'NotFoundError') {
        Sentry.captureException(err, {
          tags: { context: 'recording_error' },
        })
      }
    })

    recorderRef.current.onMaxDuration(() => {
      if (onMaxDurationReached) {
        onMaxDurationReached()
      }
    })

    return () => {
      if (recorderRef.current) {
        recorderRef.current.destroy()
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [onComplete, onMaxDurationReached])

  // Route Guard: Warn before leaving if recording or unsaved data exists
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRecording || (recordingBlob && !isInitializing)) {
        e.preventDefault()
        e.returnValue = '' // Chrome requires returnValue to be set
      }
    }

    if (isRecording || recordingBlob) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isRecording, recordingBlob, isInitializing])

  // Update duration while recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      durationIntervalRef.current = setInterval(() => {
        if (recorderRef.current) {
          setDuration(recorderRef.current.getDuration())
        }
      }, 100)
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [isRecording, isPaused])

  /**
   * Start recording
   */
  const start = useCallback(
    async (shouldWatermark: boolean = false) => {
      if (!recorderRef.current) return

      setIsInitializing(true)
      setError(null)
      setRecordingBlob(null)
      setDuration(0)

      try {
        await recorderRef.current.start({
          maxDurationSeconds: maxDuration || undefined,
          shouldWatermark,
        })
        setIsRecording(true)
        setIsInitializing(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start recording')
        setIsInitializing(false)

        if (
          err instanceof Error &&
          err.name !== 'NotAllowedError' &&
          err.name !== 'NotFoundError'
        ) {
          Sentry.captureException(err, {
            tags: { context: 'recording_start' },
          })
        }
      }
    },
    [maxDuration]
  )

  /**
   * Stop recording
   */
  const stop = useCallback(() => {
    if (!recorderRef.current) return

    recorderRef.current.stop()
  }, [])

  /**
   * Pause recording
   */
  const pause = useCallback(() => {
    if (!recorderRef.current) return

    recorderRef.current.pause()
    setIsPaused(true)
  }, [])

  /**
   * Resume recording
   */
  const resume = useCallback(() => {
    if (!recorderRef.current) return

    recorderRef.current.resume()
    setIsPaused(false)
  }, [])

  /**
   * Reset recording
   */
  const reset = useCallback(() => {
    setRecordingBlob(null)
    setDuration(0)
    setError(null)
  }, [])

  /**
   * Download the recording
   */
  const download = useCallback(
    (filename: string = 'recording.webm') => {
      if (!recordingBlob) return

      const url = URL.createObjectURL(recordingBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    [recordingBlob]
  )

  return {
    // State
    isRecording,
    isPaused,
    duration,
    recordingBlob,
    error,
    isInitializing,
    hasRecording: recordingBlob !== null,
    stream: recorderRef.current?.getStream() || null,

    // Actions
    start,
    stop,
    pause,
    resume,
    reset,
    download,
  }
}

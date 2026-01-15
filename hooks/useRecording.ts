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
  const [isSaved, setIsSaved] = useState(false) // Track if recording was saved successfully
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  const recorderRef = useRef<AudioRecorder | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Refs for callbacks to avoid re-initialization
  const onCompleteRef = useRef(onComplete)
  const onMaxDurationRef = useRef(onMaxDurationReached)

  // Update refs when props change
  useEffect(() => {
    onCompleteRef.current = onComplete
    onMaxDurationRef.current = onMaxDurationReached
  }, [onComplete, onMaxDurationReached])

  // Initialize recorder
  useEffect(() => {
    recorderRef.current = new AudioRecorder()

    recorderRef.current.onStop((blob) => {
      setRecordingBlob(blob)
      setIsRecording(false)
      setIsPaused(false)

      const finalDuration = recorderRef.current?.getDuration() || 0
      setDuration(finalDuration)

      if (onCompleteRef.current) {
        onCompleteRef.current(blob, finalDuration)
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
      if (onMaxDurationRef.current) {
        onMaxDurationRef.current()
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
  }, []) // Empty dependency array - purely mount/unmount logic for the recorder instance

  // Route Guard: Warn before leaving if recording or UNSAVED data exists
  // Skip guard if recording has been saved successfully
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if actively recording OR blob exists but hasn't been saved
      if (isRecording || (recordingBlob && !isSaved && !isInitializing)) {
        e.preventDefault()
        e.returnValue = '' // Chrome requires returnValue to be set
      }
    }

    // Only attach listener if we have unsaved data
    if (isRecording || (recordingBlob && !isSaved)) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isRecording, recordingBlob, isInitializing, isSaved])

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
      setIsSaved(false) // Reset save flag for new recording
      setDuration(0)

      try {
        await recorderRef.current.start({
          maxDurationSeconds: maxDuration || undefined,
          shouldWatermark,
        })
        setIsRecording(true)
        setIsInitializing(false)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to start recording'
        )
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
   * Reset recording state
   */
  const reset = useCallback(() => {
    setRecordingBlob(null)
    setDuration(0)
    setError(null)
    setIsSaved(false) // Allow beforeunload guard for next recording
  }, [])

  /**
   * Mark recording as successfully saved (disables beforeunload guard)
   */
  const markAsSaved = useCallback(() => {
    setIsSaved(true)
  }, [])

  /**
   * Download the recording
   */
  const download = useCallback(
    (filename?: string) => {
      if (!recordingBlob) return

      // Auto-generate structured filename if not provided
      // Format: FreeStyla_Session_YYYY-MM-DD_HH-mm.webm
      const finalFilename =
        filename ||
        `FreeStyla_Session_${new Date()
          .toISOString()
          .slice(0, 16)
          .replace(':', '-')
          .replace('T', '_')}.webm`

      const url = URL.createObjectURL(recordingBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = finalFilename
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
    markAsSaved, // Call after successful save to disable beforeunload guard
  }
}

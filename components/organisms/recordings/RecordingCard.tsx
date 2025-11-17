'use client'

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { Download, Trash2, Play, Pause, Music } from 'lucide-react'
import { Card } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { ErrorCodes } from '@/lib/errors'
import { FreestyleSessionWithBeat } from '@/types/database'
import { formatDuration, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface RecordingCardProps {
  recording: FreestyleSessionWithBeat
  onDelete: (id: string) => Promise<void>
  onDownload: (recording: FreestyleSessionWithBeat) => Promise<void>
  className?: string
}

export const RecordingCard = memo(function RecordingCard({
  recording,
  onDelete,
  onDownload,
  className,
}: RecordingCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const { error, handleError, clearError } = useErrorHandler()

  // Memoize difficulty labels to avoid recreating on every render
  const difficultyLabels = useMemo(
    () => ({
      1: 'Easy',
      2: 'Medium',
      3: 'Hard',
    }),
    []
  )

  const difficultyColors = useMemo(
    () => ({
      1: 'text-accent-green',
      2: 'text-accent-orange',
      3: 'text-accent-red',
    }),
    []
  )

  const handleDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this recording?')) {
      return
    }

    setIsDeleting(true)
    clearError()

    try {
      await onDelete(recording.id)
    } catch (err) {
      handleError(err, ErrorCodes.SESSION_DELETE_FAILED)
    } finally {
      setIsDeleting(false)
    }
  }, [recording.id, onDelete, handleError, clearError])

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    clearError()

    try {
      await onDownload(recording)
    } catch (err) {
      handleError(err, ErrorCodes.RECORDING_DOWNLOAD_FAILED)
    } finally {
      setIsDownloading(false)
    }
  }, [recording, onDownload, handleError, clearError])

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let createdAudio: HTMLAudioElement | null = null

    if (recording.storageUrl) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }

      createdAudio = new Audio(recording.storageUrl)
      audioRef.current = createdAudio

      createdAudio.onended = () => setIsPlaying(false)
      createdAudio.onpause = () => setIsPlaying(false)
      createdAudio.onplay = () => setIsPlaying(true)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }

      if (createdAudio) {
        createdAudio.pause()
        createdAudio.src = ''
      }
    }
  }, [recording.storageUrl])

  const handlePlay = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Error playing audio:', err)
        setIsPlaying(false)
      })
    }
  }, [isPlaying])

  const normalizedDifficulty = (
    recording.difficulty === 1 || recording.difficulty === 2 || recording.difficulty === 3
      ? recording.difficulty
      : 2
  ) as 1 | 2 | 3

  return (
    <Card className={cn('relative', className)}>
      {error && <ErrorAlert error={error} onDismiss={clearError} className="mb-4" />}

      <div className="flex items-start justify-between gap-4">
        {/* Left: Recording Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-orange/10 flex items-center justify-center">
              <Music size={20} className="text-accent-orange" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate">{recording.title}</h3>
              <p className="text-sm text-text-secondary">
                {recording.beat.title} • {recording.beat.bpm} BPM
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-secondary">
            <span>{formatDuration(recording.durationSeconds)}</span>
            <span>•</span>
            <span>{recording.frequency} bars</span>
            <span>•</span>
            <span className={difficultyColors[normalizedDifficulty]}>
              {difficultyLabels[normalizedDifficulty]}
            </span>
            <span>•</span>
            <span>{formatRelativeTime(recording.createdAt)}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {recording.storageUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlay}
              leftIcon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            isLoading={isDownloading}
            leftIcon={<Download size={16} />}
          >
            Download
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            leftIcon={<Trash2 size={16} />}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  )
})

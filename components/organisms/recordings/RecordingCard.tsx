'use client'

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import Link from 'next/link'
import { Download, Trash2, Play, Pause, Music, Video } from 'lucide-react'
import { Card } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { VideoGenerator } from '@/components/features/export/VideoGenerator'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { ErrorCodes } from '@/lib/errors'
import { FreestyleSessionWithBeat } from '@/types/database'
import { formatDuration, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ShareButton } from '@/components/molecules/sharing/ShareButton'

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
  const [showVideoExport, setShowVideoExport] = useState(false)
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
    recording.difficulty === 1 ||
    recording.difficulty === 2 ||
    recording.difficulty === 3
      ? recording.difficulty
      : 2
  ) as 1 | 2 | 3

  return (
    <Card className={cn('relative', className)}>
      {error && (
        <ErrorAlert error={error} onDismiss={clearError} className="mb-4" />
      )}

      <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-6 p-4">
        {/* Left: Recording Info */}
        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-orange/10 flex items-center justify-center border border-accent-orange/20">
              <Music size={24} className="text-accent-orange" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate hover:text-accent-purple transition-colors">
                <Link href={`/review/${recording.id}`} className="block">
                  {recording.title}
                </Link>
              </h3>
              <p className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <span>{recording.beat.title}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{recording.beat.bpm} BPM</span>
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-text-tertiary uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/10" />
              {formatDuration(recording.durationSeconds)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/10" />
              {recording.frequency} bars
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full bg-white/5 border border-white/10',
                difficultyColors[normalizedDifficulty]
              )}
            >
              {difficultyLabels[normalizedDifficulty]}
            </span>
            <span className="text-white/20">
              {formatRelativeTime(recording.createdAt)}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
          {recording.storageUrl && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePlay}
              leftIcon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
              className="flex-1 md:flex-none justify-center bg-white/5 hover:bg-white/10 border-white/10"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            isLoading={isDownloading}
            className="flex-1 md:flex-none justify-center px-2"
          >
            <Download size={20} className="text-text-secondary" />
          </Button>

          {recording.storageUrl && (
            <ShareButton
              title={recording.title}
              text="Check out my freestyle flow on FlowForge!"
              url={`${window.location.origin}/review/${recording.id}`}
              className="flex-1 md:flex-none justify-center w-auto border-none bg-transparent hover:bg-white/10 px-2"
              embedded={true}
            />
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVideoExport(true)}
            className="flex-1 md:flex-none justify-center px-2"
          >
            <Video size={20} className="text-text-secondary" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="flex-1 md:flex-none justify-center px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 size={20} />
          </Button>
        </div>
      </div>

      {showVideoExport && recording.storageUrl && (
        <VideoGenerator
          audioUrl={recording.storageUrl}
          title={recording.title}
          artist={recording.userId || 'User'} // We might need name if available or fetch it
          onClose={() => setShowVideoExport(false)}
        />
      )}
    </Card>
  )
})

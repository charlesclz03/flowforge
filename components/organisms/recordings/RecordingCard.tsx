'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import Link from 'next/link'
import { Download, Trash2, Play, Pause, Music, Video } from 'lucide-react'
import { Card } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { createAppError, ErrorCodes } from '@/lib/errors'
import { FreestyleSessionWithBeat } from '@/types/database'
import { formatDuration, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ShareButton } from '@/components/molecules/sharing/ShareButton'

interface RecordingCardProps {
  recording: FreestyleSessionWithBeat
  onDelete: (id: string) => Promise<void>
  onDownload: (recording: FreestyleSessionWithBeat) => Promise<void>
  className?: string
  playingId?: string | null
  onPlay?: () => void
}

export const RecordingCard = memo(function RecordingCard({
  recording,
  onDelete,
  onDownload,
  className,
  playingId,
  onPlay,
}: RecordingCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackError, setPlaybackError] = useState<string | null>(null)
  const { error, handleError, clearError } = useErrorHandler()

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
  const beatRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let createdAudio: HTMLAudioElement | null = null
    let createdBeat: HTMLAudioElement | null = null

    if (recording.storageUrl) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      if (beatRef.current) {
        beatRef.current.pause()
        beatRef.current.src = ''
      }

      createdAudio = new Audio(recording.storageUrl)
      audioRef.current = createdAudio

      // Initialize beat audio if available
      if (recording.beat?.storageUrl) {
        createdBeat = new Audio(recording.beat.storageUrl)
        createdBeat.volume = 0.8 // Default mix volume
        createdBeat.loop = true // Loop beat to match recording if session was longer than beat duration
        beatRef.current = createdBeat
      }

      createdAudio.onended = () => {
        setIsPlaying(false)
        if (beatRef.current) {
          beatRef.current.pause()
          beatRef.current.currentTime = 0
        }
      }

      createdAudio.onpause = () => {
        setIsPlaying(false)
        if (beatRef.current) beatRef.current.pause()
      }

      createdAudio.onplay = () => {
        setIsPlaying(true)
        if (beatRef.current) {
          beatRef.current
            .play()
            .catch((e) => console.error('Beat playback error:', e))
        }
      }

      createdAudio.onerror = (e) => {
        // Only show error if we were actually trying to play
        if (playingId === recording.id) {
          console.error('Playback error:', e)
          setPlaybackError(
            'Failed to play recording. The file may be missing or corrupted.'
          )
        }
        setIsPlaying(false)
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
      if (beatRef.current) {
        beatRef.current.pause()
        beatRef.current.src = ''
        beatRef.current = null
      }

      if (createdAudio) {
        createdAudio.pause()
        createdAudio.src = ''
      }
      if (createdBeat) {
        createdBeat.pause()
        createdBeat.src = ''
      }
    }
  }, [recording.storageUrl, recording.beat, playingId, recording.id])

  // Effect: Sync local state with global playingId
  useEffect(() => {
    if (playingId !== undefined) {
      if (playingId === recording.id) {
        // We SHOULD be playing - manual click starts playback, handled in click handler
      } else {
        // We should NOT be playing
        if (isPlaying) {
          setIsPlaying(false)
          if (audioRef.current) audioRef.current.pause()
          if (beatRef.current) beatRef.current.pause()
        }
      }
    }
  }, [playingId, recording.id, isPlaying])

  const handlePlay = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      // Optional: onPlay() to toggle off?
      // For now we just pause locally, playingId remains set in list until another plays
      // But if we want consistent state, we could call onPlay() which might toggle it off in parent
      if (onPlay && playingId === recording.id) onPlay()
    } else {
      if (onPlay) onPlay()

      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error('Error playing audio:', err)
          setIsPlaying(false)
          if (err.name !== 'AbortError') {
            setPlaybackError('Failed to play. Please try again.')
          }
        })
      }
    }
  }, [isPlaying, onPlay, playingId, recording.id])

  return (
    <Card className={cn('relative', className)}>
      {(error || playbackError) && (
        <ErrorAlert
          error={
            error ||
            createAppError(playbackError, ErrorCodes.AUDIO_PLAYBACK_FAILED)
          }
          onDismiss={() => {
            clearError()
            setPlaybackError(null)
          }}
          className="mb-4"
        />
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
              {recording.wordCount || 0} Words
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
              text="Check out my freestyle flow on FreeStyla!"
              url={`${window.location.origin}/review/${recording.id}`}
              className="flex-1 md:flex-none justify-center w-auto border-none bg-transparent hover:bg-white/10 px-2"
              embedded={true}
            />
          )}

          <Link
            href={`/recordings/${recording.id}/video`}
            className="flex-1 md:flex-none"
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center px-2"
            >
              <Video size={20} className="text-text-secondary" />
            </Button>
          </Link>

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
    </Card>
  )
})

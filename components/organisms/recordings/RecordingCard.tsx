'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Download, Trash2, Play, Pause, Music, Video } from 'lucide-react'
import { Card } from '@/components/atoms/Card'
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { createAppError, ErrorCodes } from '@/lib/errors'
import { FreestyleSessionWithBeat } from '@/types/database'
import { formatDuration, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ShareButton } from '@/components/molecules/sharing/ShareButton'
import { SeamlessLooper } from '@/lib/audio/seamless-looper'

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackError, setPlaybackError] = useState<string | null>(null)
  const { error, handleError, clearError } = useErrorHandler()
  const router = useRouter() // Added for refreshing expired links

  const confirmDelete = useCallback(async () => {
    setIsDeleting(true)
    clearError()

    try {
      await onDelete(recording.id)
    } catch (err) {
      handleError(err, ErrorCodes.SESSION_DELETE_FAILED)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
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
  // Use SeamlessLooper for gapless beat looping
  const beatLooperRef = useRef<SeamlessLooper | null>(null)

  useEffect(() => {
    let createdAudio: HTMLAudioElement | null = null
    let beatLooper: SeamlessLooper | null = null

    if (recording.storageUrl && recording.storageUrl.startsWith('http')) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      if (beatLooperRef.current) {
        beatLooperRef.current.destroy()
        beatLooperRef.current = null
      }

      createdAudio = new Audio(recording.storageUrl)
      audioRef.current = createdAudio

      // Initialize beat with SeamlessLooper for gapless playback
      if (recording.beat?.storageUrl) {
        beatLooper = new SeamlessLooper()
        beatLooper.setVolume(0.8) // Default mix volume
        beatLooper.load(recording.beat.storageUrl).catch((err) => {
          console.error('Failed to load beat for seamless looping:', err)
        })
        beatLooperRef.current = beatLooper
      }

      createdAudio.onended = () => {
        setIsPlaying(false)
        if (beatLooperRef.current) {
          beatLooperRef.current.stop()
        }
      }

      createdAudio.onpause = () => {
        setIsPlaying(false)
        if (beatLooperRef.current) beatLooperRef.current.pause()
      }

      createdAudio.onplay = () => {
        setIsPlaying(true)
        if (beatLooperRef.current) {
          beatLooperRef.current.play()
        }
      }

      createdAudio.onerror = (e) => {
        // Only show error if we were actually trying to play
        if (playingId === recording.id) {
          console.error('Playback error:', e)
          setPlaybackError('Link expired. Click refreshing...')
          // Auto-refresh to get new link
          router.refresh()
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
      if (beatLooperRef.current) {
        beatLooperRef.current.destroy()
        beatLooperRef.current = null
      }

      if (createdAudio) {
        createdAudio.pause()
        createdAudio.src = ''
      }
      if (beatLooper) {
        beatLooper.destroy()
      }
    }
  }, [recording.storageUrl, recording.beat.storageUrl, recording.id])

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
          if (beatLooperRef.current) beatLooperRef.current.pause()
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
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Recording?"
      >
        <div className="space-y-6">
          <p className="text-zinc-300">
            Are you sure you want to delete this recording? This action cannot
            be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
              isLoading={isDeleting}
              className="bg-red-500 hover:bg-red-600 border-red-400/20"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {(error || playbackError) && (
        <div className="mb-4">
          <ErrorAlert
            error={
              error ||
              createAppError(playbackError, ErrorCodes.AUDIO_PLAYBACK_FAILED)
            }
            onDismiss={() => {
              clearError()
              setPlaybackError(null)
            }}
          />
          {playbackError && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.refresh()}
              className="w-full mt-2 text-xs bg-white/5 hover:bg-white/10"
            >
              Reload Recording Links
            </Button>
          )}
        </div>
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
          {recording.storageUrl && recording.storageUrl.startsWith('http') && (
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

          {recording.storageUrl && recording.storageUrl.startsWith('http') && (
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
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 md:flex-none justify-center px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 size={20} />
          </Button>
        </div>
      </div>
    </Card>
  )
})

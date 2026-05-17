'use client'

import { useState, useEffect, memo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Download,
  Trash2,
  Play,
  Pause,
  Music,
  Video,
  MicOff,
  RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/atoms/Card'
import { IconFrame } from '@/components/atoms/IconFrame'
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'

import { createAppError, ErrorCodes } from '@/lib/errors'
import { FreestyleSessionWithBeat } from '@/types/database'
import { formatDuration, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ShareButton } from '@/components/molecules/sharing/ShareButton'
import { useRecordingPlayback } from '@/hooks/useRecordingPlayback'

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
  // Hooks
  const router = useRouter()
  // const { handleError } = useErrorHandler() // Unused

  // State
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const {
    isPlaying,
    error: playbackError,
    play,
    pause,
  } = useRecordingPlayback({
    recordingUrl: recording.storageUrl,
    beatUrl: recording.beat?.storageUrl || null,
    recordingId: recording.id,
    beatOffsetMs: recording.beatOffsetMs ?? null,
    fxConfig: recording.fxConfig ?? null,
    onPlayStateChange: useCallback((_isPlaying: boolean) => {
      // hook manages local state perfectly
    }, []),
  })

  // Handlers
  const confirmDelete = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await onDelete(recording.id)
      setShowDeleteConfirm(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    setError(null)
    try {
      await onDownload(recording)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to download'))
    } finally {
      setIsDownloading(false)
    }
  }

  const clearError = () => setError(null)

  // Effect: Global Play/Pause Check
  useEffect(() => {
    if (playingId === recording.id && !isPlaying) {
      play()
    } else if (playingId !== recording.id && isPlaying) {
      pause()
    }
  }, [playingId, recording.id, isPlaying, play, pause])

  const displayError = error
    ? createAppError(error, ErrorCodes.UNKNOWN_ERROR)
    : playbackError
      ? createAppError(playbackError, ErrorCodes.AUDIO_PLAYBACK_FAILED)
      : null

  const hasAudio = Boolean(recording.storageUrl)
  const hasStreamableAudio =
    typeof recording.storageUrl === 'string' &&
    recording.storageUrl.startsWith('http')
  const audioStatus =
    recording.audioStatus ??
    (hasStreamableAudio ? 'ready' : hasAudio ? 'processing' : 'stats-only')
  const isAudioReady = audioStatus === 'ready' && hasStreamableAudio

  return (
    <Card
      className={cn('relative', className)}
      style={{ contentVisibility: 'auto' }}
    >
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

      {displayError && (
        <div className="mb-4">
          <ErrorAlert
            error={displayError}
            onDismiss={() => {
              clearError()
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
            <IconFrame icon={Music} variant="action" tone="orange" decorative />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">
                {isAudioReady ? (
                  <Link
                    href={`/review/${recording.id}`}
                    className="block hover:text-accent-purple transition-colors"
                  >
                    {recording.title}
                  </Link>
                ) : (
                  recording.title
                )}
              </h3>
              <p className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <span>{recording.beat.title}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{recording.beat.bpm} BPM</span>
              </p>
              {audioStatus === 'processing' && (
                <div
                  className="mt-1 flex items-center gap-3"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-xs text-accent-cyan uppercase tracking-wide flex items-center gap-1.5 font-bold">
                    <span className="w-3 h-3 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
                    Processing Audio
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      router.refresh()
                    }}
                    className="text-[10px] text-white/40 hover:text-white flex items-center gap-1 transition-colors bg-white/5 px-2 py-0.5 rounded-full"
                  >
                    <IconFrame
                      icon={RefreshCw}
                      variant="inline"
                      tone="white"
                      decorative
                      className="h-3 w-3 text-white/40"
                      iconClassName="h-3 w-3"
                    />
                    Refresh
                  </button>
                </div>
              )}
              {audioStatus === 'stats-only' && (
                <p className="mt-1 text-xs text-accent-yellow uppercase tracking-wide flex items-center gap-1.5 font-bold opacity-90">
                  <IconFrame
                    icon={MicOff}
                    variant="inline"
                    tone="gold"
                    decorative
                    iconClassName="h-3 w-3"
                  />
                  Stats-Only (No Mic)
                </p>
              )}
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
          {isAudioReady && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPlay?.()}
              leftIcon={
                <IconFrame
                  icon={isPlaying ? Pause : Play}
                  variant="inline"
                  tone="white"
                  decorative
                />
              }
              className="flex-1 md:flex-none justify-center bg-white/5 hover:bg-white/10 border-white/10"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          )}
          {isAudioReady && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              isLoading={isDownloading}
              className="flex-1 md:flex-none justify-center px-2"
            >
              <IconFrame
                icon={Download}
                variant="inline"
                tone="zinc"
                decorative
              />
            </Button>
          )}

          {isAudioReady && (
            <ShareButton
              title={recording.title}
              text="Check out my freestyle flow on FreeStyla!"
              url={`${window.location.origin}/s/${recording.id}`}
              className="flex-1 md:flex-none justify-center w-auto border-none bg-transparent hover:bg-white/10 px-2"
              embedded={true}
            />
          )}

          {isAudioReady && (
            <Link
              href={`/recordings/${recording.id}/video`}
              className="flex-1 md:flex-none"
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center px-2"
              >
                <IconFrame
                  icon={Video}
                  variant="inline"
                  tone="zinc"
                  decorative
                />
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 md:flex-none justify-center px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <IconFrame icon={Trash2} variant="inline" tone="red" decorative />
          </Button>
        </div>
      </div>
    </Card>
  )
})

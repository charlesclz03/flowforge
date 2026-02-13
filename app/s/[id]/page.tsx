'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
// import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import {
  SessionPlayer,
  SessionPlayerHandles,
  AudioSettings,
} from '@/components/organisms/recordings/SessionPlayer'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { FreestyleSessionWithBeat } from '@/types/database'
import { ErrorCodes } from '@/lib/errors'
import { ReviewTemplate } from '@/components/templates/ReviewTemplate'
import { ShareButton } from '@/components/molecules/sharing/ShareButton'
import { resolveRecordingSync } from '@/lib/audio/recording-sync'

type PersistedFxConfig = {
  voiceVolume?: number
  beatVolume?: number
  nudge?: number
  reverb?: boolean
  isStudioMode?: boolean
}

function normalizeAudioSettings(recording: FreestyleSessionWithBeat): AudioSettings {
  const fx =
    recording.fxConfig &&
    typeof recording.fxConfig === 'object' &&
    !Array.isArray(recording.fxConfig)
      ? (recording.fxConfig as unknown as PersistedFxConfig)
      : null

  return {
    voiceVolume:
      typeof fx?.voiceVolume === 'number' && Number.isFinite(fx.voiceVolume)
        ? fx.voiceVolume
        : 1.0,
    beatVolume:
      typeof fx?.beatVolume === 'number' && Number.isFinite(fx.beatVolume)
        ? fx.beatVolume
        : 0.8,
    isStudioMode:
      typeof fx?.isStudioMode === 'boolean'
        ? fx.isStudioMode
        : typeof fx?.reverb === 'boolean'
          ? fx.reverb
          : true,
    nudge: resolveRecordingSync({
      beatOffsetMs: recording.beatOffsetMs ?? 0,
      fxConfig: recording.fxConfig,
    }).nudgeMs,
  }
}

export default function SharedRecordingPage() {
  const routeParams = useParams<{ id: string }>()
  const recordingId = routeParams?.id
  // const router = useRouter()
  const [recording, setRecording] = useState<FreestyleSessionWithBeat | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const { error, handleError, clearError } = useErrorHandler()
  const playerRef = useRef<SessionPlayerHandles>(null)

  const fetchRecording = useCallback(async () => {
    if (!recordingId) return
    try {
      // Public API access (bypass auth check if isPublic=true)
      const response = await fetch(`/api/recordings/${recordingId}`)
      if (!response.ok) {
        if (response.status === 404) throw new Error('Recording not found')
        if (response.status === 403)
          throw new Error('This recording is private')
        throw new Error('Failed to fetch recording')
      }
      const data = await response.json()
      setRecording(data.recording)
    } catch (err) {
      handleError(err, ErrorCodes.FETCH_RECORDINGS_FAILED)
    } finally {
      setIsLoading(false)
    }
  }, [recordingId, handleError])

  useEffect(() => {
    if (recordingId) {
      fetchRecording()
    }
  }, [recordingId, fetchRecording])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!recording) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 p-4 text-center">
        <h1 className="text-xl text-white font-bold">Recording Unavailable</h1>
        <p className="text-text-secondary">
          This recording might be private or deleted.
        </p>
        <Link href="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <ReviewTemplate
      header={
        <AppHeader
          showBackButton={false}
          customTitle="FREESTYLA"
          customSubtitle="Shared Session"
        />
      }
      pageHeader={
        <div className="w-full max-w-2xl mx-auto">
          <div className="grid grid-cols-[1fr_auto] items-start gap-3">
            <div className="min-w-0 space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase line-clamp-2">
                {recording.title}
              </h1>
              <p className="text-accent-purple font-medium">
                Recorded by{' '}
                {recording.user?.name ||
                  recording.user?.username ||
                  'Anonymous'}
              </p>
            </div>
            <ShareButton
              title={recording.title}
              text={`Check out this freestyle by ${recording.user?.name || 'an artist'} on FreeStyla!`}
              url={typeof window !== 'undefined' ? window.location.href : ''}
              className="px-3 py-2 justify-center whitespace-nowrap"
            />
          </div>
        </div>
      }
      alerts={error && <ErrorAlert error={error} onDismiss={clearError} />}
      player={
        <SessionPlayer
          ref={playerRef}
          audioUrl={recording.storageUrl}
          beatUrl={recording.beat?.storageUrl}
          beatOffsetMs={
            resolveRecordingSync({
              beatOffsetMs: recording.beatOffsetMs ?? 0,
              fxConfig: recording.fxConfig,
            }).beatOffsetMs
          }
          beatTitle={recording.beat?.title}
          beatBpm={recording.beat?.bpm}
          beatArtist={recording.beat?.artistName ?? undefined}
          sessionDuration={recording.durationSeconds}
          sessionDifficulty={recording.difficulty}
          sessionDate={recording.createdAt}
          initialSettings={normalizeAudioSettings(recording)}
        />
      }
    />
  )
}

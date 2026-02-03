'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
// import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import {
  SessionPlayer,
  SessionPlayerHandles,
  AudioSettings,
} from '@/components/organisms/recordings/SessionPlayer'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { Mic } from 'lucide-react'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { FreestyleSessionWithBeat } from '@/types/database'
import { ErrorCodes } from '@/lib/errors'
import { ReviewTemplate } from '@/components/templates/ReviewTemplate'
import { ShareButton } from '@/components/molecules/sharing/ShareButton'

export default function SharedRecordingPage({
  params,
}: {
  params: { id: string }
}) {
  // const router = useRouter()
  const [recording, setRecording] = useState<FreestyleSessionWithBeat | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const { error, handleError, clearError } = useErrorHandler()
  const playerRef = useRef<SessionPlayerHandles>(null)

  const fetchRecording = useCallback(async () => {
    try {
      // Public API access (bypass auth check if isPublic=true)
      const response = await fetch(`/api/recordings/${params.id}`)
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
  }, [params.id, handleError])

  useEffect(() => {
    fetchRecording()
  }, [fetchRecording])

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
          action={
            <Link href="/">
              <Button size="sm" variant="primary" className="gap-2">
                <Mic size={16} />
                <span className="hidden sm:inline">Start Freestyling</span>
              </Button>
            </Link>
          }
        />
      }
      pageHeader={
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            {recording.title}
          </h1>
          <p className="text-accent-purple font-medium">
            Recorded by{' '}
            {recording.user?.name || recording.user?.username || 'Anonymous'}
          </p>
        </div>
      }
      alerts={error && <ErrorAlert error={error} onDismiss={clearError} />}
      player={
        <SessionPlayer
          ref={playerRef}
          audioUrl={recording.storageUrl}
          beatUrl={recording.beat?.storageUrl}
          beatOffsetMs={
            (recording as FreestyleSessionWithBeat & { beatOffsetMs?: number })
              .beatOffsetMs
          }
          beatTitle={recording.beat?.title}
          beatBpm={recording.beat?.bpm}
          beatArtist={recording.beat?.artistName ?? undefined}
          sessionDuration={recording.durationSeconds}
          sessionDifficulty={recording.difficulty}
          sessionDate={recording.createdAt}
          // Enforce read-only / studio defaults if needed, or let player handle it
          initialSettings={
            recording.fxConfig
              ? (recording.fxConfig as unknown as AudioSettings)
              : {
                  voiceVolume: 1.0,
                  beatVolume: 0.8,
                  isStudioMode: true,
                  nudge: recording.beatOffsetMs || 0,
                }
          }
        />
      }
      actions={
        <div className="flex justify-center w-full">
          <ShareButton
            title={recording.title}
            text={`Check out this freestyle by ${recording.user?.name || 'an artist'} on FreeStyla!`}
            url={typeof window !== 'undefined' ? window.location.href : ''}
            className="w-full sm:w-auto justify-center"
          />
        </div>
      }
    />
  )
}

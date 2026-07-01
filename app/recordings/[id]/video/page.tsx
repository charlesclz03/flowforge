'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { ReviewTemplate } from '@/components/templates/ReviewTemplate'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { Spinner } from '@/components/atoms/Spinner'
import { Button } from '@/components/atoms/Button'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { FreestyleSessionWithBeat } from '@/types/database'
import { ErrorCodes } from '@/lib/errors'
import { VideoCreator } from '@/components/features/export/VideoCreator'
import { isProUser } from '@/lib/subscription/isPro'
import { AudioMixer } from '@/lib/audio/mixer'
import { resolveRecordingSync } from '@/lib/audio/recording-sync'
import dynamic from 'next/dynamic'

// Client-only, code-split: the Remotion player only loads on this Pro page.
const RemotionClipPreview = dynamic(
  () =>
    import('@/components/features/export/RemotionClipPreview').then(
      (m) => m.RemotionClipPreview
    ),
  { ssr: false }
)

export default function VideoExportPage() {
  const routeParams = useParams<{ id: string }>()
  const recordingId = routeParams?.id
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recording, setRecording] = useState<FreestyleSessionWithBeat | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isPreparingAudio, setIsPreparingAudio] = useState(false)
  const [videoAudioUrl, setVideoAudioUrl] = useState<string | null>(null)
  const { error, handleError, clearError } = useErrorHandler()
  const preparedUrlRef = useRef<string | null>(null)

  const fetchRecording = useCallback(async () => {
    if (!recordingId) return
    try {
      const response = await fetch(`/api/recordings/${recordingId}`)
      if (!response.ok) {
        if (response.status === 404) throw new Error('Recording not found')
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
    if (status === 'authenticated' && recordingId) {
      fetchRecording()
    }
  }, [status, recordingId, fetchRecording])

  useEffect(() => {
    return () => {
      if (preparedUrlRef.current) {
        URL.revokeObjectURL(preparedUrlRef.current)
        preparedUrlRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const currentRecording = recording
    if (!currentRecording) {
      setVideoAudioUrl(null)
      return
    }

    const voiceUrl = currentRecording.storageUrl ?? null
    const beatUrl = currentRecording.beat?.storageUrl ?? null
    const beatOffsetMs = currentRecording.beatOffsetMs ?? 0
    const fxConfig = currentRecording.fxConfig
    const fx =
      fxConfig && typeof fxConfig === 'object'
        ? (fxConfig as Record<string, unknown>)
        : {}

    if (!voiceUrl) {
      setVideoAudioUrl(null)
      return
    }

    if (!beatUrl) {
      setVideoAudioUrl(voiceUrl)
      return
    }

    let cancelled = false

    const prepareMixedAudio = async () => {
      setIsPreparingAudio(true)

      if (preparedUrlRef.current) {
        URL.revokeObjectURL(preparedUrlRef.current)
        preparedUrlRef.current = null
      }

      try {
        const resolvedSync = resolveRecordingSync({
          beatOffsetMs,
          fxConfig,
        })

        const mixer = new AudioMixer()
        const blob = await mixer.mix(voiceUrl, beatUrl, {
          voiceVolume:
            typeof fx.voiceVolume === 'number' &&
            Number.isFinite(fx.voiceVolume)
              ? fx.voiceVolume
              : 1.0,
          beatVolume:
            typeof fx.beatVolume === 'number' && Number.isFinite(fx.beatVolume)
              ? fx.beatVolume
              : 0.8,
          isStudioMode: fxConfig ? !!fx.reverb : true,
          nudge: resolvedSync.nudgeMs,
          beatOffsetMs: resolvedSync.beatOffsetMs,
        })

        if (cancelled) return

        const url = URL.createObjectURL(blob)
        preparedUrlRef.current = url
        setVideoAudioUrl(url)
      } catch (err) {
        if (cancelled) return
        handleError(err, ErrorCodes.UNKNOWN_ERROR)
        setVideoAudioUrl(voiceUrl)
      } finally {
        if (!cancelled) {
          setIsPreparingAudio(false)
        }
      }
    }

    prepareMixedAudio()

    return () => {
      cancelled = true
    }
  }, [recording, handleError])

  const handleBack = () => router.push('/recordings')

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/')
    return null
  }

  // Access Control: Pro Only
  const isPro = isProUser(session?.user)
  if (!isPro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-center p-6 gap-6">
        <div className="w-16 h-16 rounded-full bg-accent-purple/20 flex items-center justify-center mb-2">
          <span className="text-3xl">🔒</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-pink mb-2">
            Pro Feature Locked
          </h1>
          <p className="text-text-secondary max-w-md mx-auto">
            Video export is exclusively available to Pro members. Upgrade to
            create viral social clips of your freestyles.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={handleBack}>
            Back
          </Button>
          <Button
            className="bg-accent-purple hover:bg-accent-purple/80 text-white px-8"
            onClick={() => router.push('/settings')}
          >
            Upgrade to Pro
          </Button>
        </div>
      </div>
    )
  }

  if (!recording || !recording.storageUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-xl text-white">Recording not found or invalid</h1>
        <Button onClick={handleBack}>Back to Recordings</Button>
      </div>
    )
  }

  return (
    <ReviewTemplate
      header={
        <AppHeader
          showBackButton={true}
          onBack={handleBack}
          customTitle="VIDEO EXPORT"
          customSubtitle={`Create a video for "${recording.title}"`}
        />
      }
      pageHeader={null}
      alerts={error && <ErrorAlert error={error} onDismiss={clearError} />}
      player={
        <div className="w-full">
          {isPreparingAudio && (
            <div className="min-h-[240px] flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-background-card/60 p-8 text-center">
              <Spinner size="lg" />
              <p className="text-sm text-text-secondary">
                Preparing your studio mix for video export...
              </p>
            </div>
          )}

          {!isPreparingAudio && (
            <div className="space-y-8">
              <RemotionClipPreview
                title={recording.title}
                handle={`@${session?.user?.username ?? 'freestyla'}`}
                audioSrc={videoAudioUrl ?? recording.storageUrl}
              />
              <VideoCreator
                audioUrl={videoAudioUrl ?? recording.storageUrl}
                title={recording.title}
                artist={recording.userId || 'User'}
                onBack={handleBack}
              />
            </div>
          )}
        </div>
      }
      metadata={null}
      actions={null}
    />
  )
}

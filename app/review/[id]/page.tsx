'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { ReviewTemplate } from '@/components/templates/ReviewTemplate'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import {
  SessionPlayer,
  SessionPlayerHandles,
  AudioSettings,
} from '@/components/organisms/recordings/SessionPlayer'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { Surface } from '@/components/atoms/Surface'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { Download, Trash2 } from 'lucide-react'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { ConfirmDialog } from '@/components/molecules/feedback/ConfirmDialog'
import { FreestyleSessionWithBeat } from '@/types/database'
import { ErrorCodes } from '@/lib/errors'
import { AudioMixer } from '@/lib/audio/mixer'
import { toast } from 'react-hot-toast'
import { ShareButton } from '@/components/molecules/sharing/ShareButton'
import { resolveRecordingSync } from '@/lib/audio/recording-sync'
import { formatDuration } from '@/lib/utils'

type PersistedFxConfig = {
  voiceVolume?: number
  beatVolume?: number
  nudge?: number
  reverb?: boolean
  isStudioMode?: boolean
}

function normalizeAudioSettings(
  recording: FreestyleSessionWithBeat
): AudioSettings {
  const fx =
    recording.fxConfig &&
    typeof recording.fxConfig === 'object' &&
    !Array.isArray(recording.fxConfig)
      ? (recording.fxConfig as unknown as PersistedFxConfig)
      : null

  const resolvedSync = resolveRecordingSync({
    beatOffsetMs: recording.beatOffsetMs ?? 0,
    fxConfig: recording.fxConfig,
  })

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
    nudge: resolvedSync.nudgeMs,
  }
}

function areSettingsEqual(
  a: AudioSettings | null,
  b: AudioSettings | null
): boolean {
  if (!a || !b) return false

  return (
    Math.abs((a.voiceVolume ?? 1) - (b.voiceVolume ?? 1)) < 0.0001 &&
    Math.abs((a.beatVolume ?? 0.8) - (b.beatVolume ?? 0.8)) < 0.0001 &&
    Boolean(a.isStudioMode ?? true) === Boolean(b.isStudioMode ?? true) &&
    Math.trunc(a.nudge ?? 0) === Math.trunc(b.nudge ?? 0)
  )
}

export default function ReviewPage() {
  const routeParams = useParams<{ id: string }>()
  const recordingId = routeParams?.id
  const { status } = useSession()
  const router = useRouter()
  const [recording, setRecording] = useState<FreestyleSessionWithBeat | null>(
    null
  )
  const [savedSettings, setSavedSettings] = useState<AudioSettings | null>(null)
  const [currentSettings, setCurrentSettings] = useState<AudioSettings | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { error, handleError, clearError } = useErrorHandler()

  // Ref to get volume/fx settings from player
  const playerRef = useRef<SessionPlayerHandles>(null)

  const fetchRecording = useCallback(async () => {
    if (!recordingId) return
    try {
      const response = await fetch(`/api/recordings/${recordingId}`)
      if (!response.ok) {
        if (response.status === 404) throw new Error('Recording not found')
        throw new Error('Failed to fetch recording')
      }
      const data = await response.json()
      const loadedRecording = data.recording as FreestyleSessionWithBeat
      const normalizedSettings = normalizeAudioSettings(loadedRecording)
      setRecording(loadedRecording)
      setSavedSettings(normalizedSettings)
      setCurrentSettings(normalizedSettings)
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

  const hasUnsavedSettingsChanges =
    Boolean(currentSettings && savedSettings) &&
    !areSettingsEqual(currentSettings, savedSettings)

  const handleSettingsChange = useCallback((settings: AudioSettings) => {
    setCurrentSettings(settings)
  }, [])

  const handleSaveSettings = useCallback(async () => {
    if (!recordingId || !currentSettings) return

    setIsSavingSettings(true)
    try {
      const fxConfig = {
        voiceVolume: Number((currentSettings.voiceVolume ?? 1).toFixed(3)),
        beatVolume: Number((currentSettings.beatVolume ?? 0.8).toFixed(3)),
        nudge: Math.trunc(currentSettings.nudge ?? 0),
        reverb: Boolean(currentSettings.isStudioMode ?? true),
        isStudioMode: Boolean(currentSettings.isStudioMode ?? true),
      }

      const response = await fetch(`/api/recordings/${recordingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fxConfig }),
      })

      if (!response.ok) {
        throw new Error('Failed to save studio settings')
      }

      setRecording((prev) =>
        prev
          ? ({
              ...prev,
              fxConfig,
            } as FreestyleSessionWithBeat)
          : prev
      )
      setSavedSettings({
        voiceVolume: fxConfig.voiceVolume,
        beatVolume: fxConfig.beatVolume,
        isStudioMode: fxConfig.isStudioMode,
        nudge: fxConfig.nudge,
      })

      toast.success('Studio settings saved')
    } catch (err) {
      handleError(err, ErrorCodes.SESSION_SAVE_FAILED)
    } finally {
      setIsSavingSettings(false)
    }
  }, [currentSettings, handleError, recordingId])

  const handleDelete = async () => {
    if (!recordingId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/recordings/${recordingId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      setShowDeleteConfirm(false)
      router.push('/recordings')
    } catch (err) {
      handleError(err, ErrorCodes.SESSION_DELETE_FAILED)
      setIsDeleting(false)
    }
  }

  const handleDownload = async () => {
    if (!recording?.storageUrl) return

    const toastId = toast.loading('Rendering Studio Quality...')

    try {
      // Get current settings from player (mix what you hear)
      const settings = playerRef.current?.getSettings() || {
        voiceVolume: 1.0,
        beatVolume: 0.8,
        isStudioMode: true,
        nudge: 0,
      }

      const mixer = new AudioMixer()
      const resolvedSync = resolveRecordingSync({
        beatOffsetMs: recording.beatOffsetMs ?? 0,
        fxConfig: recording.fxConfig,
      })
      const blob = await mixer.mix(
        recording.storageUrl,
        recording.beat?.storageUrl || null,
        {
          voiceVolume: settings.voiceVolume,
          beatVolume: settings.beatVolume,
          isStudioMode: settings.isStudioMode,
          nudge: settings.nudge,
          beatOffsetMs: resolvedSync.beatOffsetMs,
        }
      )

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${recording.title}-studio.wav`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Download complete!', { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error('Download failed', { id: toastId })
      handleError(err, ErrorCodes.RECORDING_DOWNLOAD_FAILED)
    }
  }

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

  if (!recordingId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-xl text-white">Recording not found</h1>
        <Button onClick={handleBack}>Back to Recordings</Button>
      </div>
    )
  }

  if (!recording) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-xl text-white">Recording not found</h1>
        <Button onClick={handleBack}>Back to Recordings</Button>
      </div>
    )
  }

  return (
    <ReviewTemplate
      header={
        <>
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            title="Delete Recording?"
            description="This permanently removes the recording and its saved settings. This action cannot be undone."
            confirmLabel="Delete Recording"
            isLoading={isDeleting}
            tone="danger"
          />
          <AppHeader
            showBackButton={true}
            onBack={handleBack}
            customTitle="TRACK REVIEW"
            customSubtitle="Listen back and analyze your flow"
          />
        </>
      }
      pageHeader={
        <div className="w-full max-w-2xl mx-auto">
          <div className="grid grid-cols-[1fr_auto] items-start gap-3">
            <div className="min-w-0 space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase line-clamp-2">
                {recording.title}
              </h1>
              {recording.beat?.title && (
                <p className="text-text-secondary font-medium truncate">
                  {recording.beat.title}
                </p>
              )}
            </div>
            {recording.storageUrl && (
              <ShareButton
                title={recording.title}
                text={`Check out my freestyle flow on FreeStyla!`}
                url={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/s/${recording.id}`
                    : ''
                }
                className="px-3 py-2 justify-center whitespace-nowrap"
              />
            )}
          </div>
        </div>
      }
      alerts={error && <ErrorAlert error={error} onDismiss={clearError} />}
      player={
        recording.storageUrl ? (
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
            initialSettings={savedSettings ?? undefined}
            onSettingsChange={handleSettingsChange}
          />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-background-card/60 p-8 text-center space-y-3">
            <h3 className="text-lg font-semibold text-white">
              No audio was captured for this session
            </h3>
            <p className="text-sm text-text-secondary">
              This run was saved as stats-only metadata, so waveform review is
              unavailable.
            </p>
            <div className="pt-2">
              <Button onClick={() => router.push('/practice')}>
                Start New Recording
              </Button>
            </div>
          </div>
        )
      }
      metadata={
        <Surface tone="elevated" padding="md" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <StatusBadge
                tone={hasUnsavedSettingsChanges ? 'warning' : 'success'}
              >
                {hasUnsavedSettingsChanges
                  ? 'Unsaved studio changes'
                  : 'Settings saved'}
              </StatusBadge>
              <h2 className="mt-3 text-lg font-semibold text-white">
                Studio analysis
              </h2>
            </div>
            <p className="text-xs text-text-tertiary">
              {new Date(recording.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Duration', formatDuration(recording.durationSeconds)],
              ['Beat', recording.beat?.title ?? 'No beat'],
              ['BPM', recording.beat?.bpm ? `${recording.beat.bpm}` : 'Unset'],
              ['Difficulty', `${recording.difficulty}/3`],
              ['Words', `${recording.wordCount || 0}`],
              [
                'Studio nudge',
                `${Math.trunc(currentSettings?.nudge ?? savedSettings?.nudge ?? 0)} ms`,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-black/25 px-4 py-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
                  {label}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </Surface>
      }
      actions={
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {recording.storageUrl && hasUnsavedSettingsChanges && (
            <Button
              variant="primary"
              onClick={handleSaveSettings}
              isLoading={isSavingSettings}
              className="w-full sm:w-auto"
            >
              Save Changes
            </Button>
          )}
          {recording.storageUrl && (
            <Button
              variant="secondary"
              onClick={handleDownload}
              leftIcon={<Download size={18} />}
              className="w-full sm:w-auto"
            >
              Download
            </Button>
          )}
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            isLoading={isDeleting}
            leftIcon={<Trash2 size={18} />}
            className="w-full sm:w-auto"
          >
            Delete
          </Button>
        </div>
      }
    />
  )
}

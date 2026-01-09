'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ReviewTemplate } from '@/components/templates/ReviewTemplate'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { PageHeader } from '@/components/organisms/common'
import { SessionPlayer } from '@/components/organisms/recordings/SessionPlayer'
import { SessionMetadata } from '@/components/organisms/recordings/SessionMetadata'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { Download, Trash2 } from 'lucide-react'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { FreestyleSessionWithBeat } from '@/types/database'
import { ErrorCodes } from '@/lib/errors'

export default function ReviewPage({ params }: { params: { id: string } }) {
  const { status } = useSession()
  const router = useRouter()
  const [recording, setRecording] = useState<FreestyleSessionWithBeat | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const { error, handleError, clearError } = useErrorHandler()

  const fetchRecording = useCallback(async () => {
    try {
      const response = await fetch(`/api/recordings/${params.id}`)
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
  }, [params.id, handleError])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRecording()
    }
  }, [status, fetchRecording])

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this recording? This cannot be undone.'
      )
    )
      return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/recordings/${params.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      router.push('/recordings')
    } catch (err) {
      handleError(err, ErrorCodes.SESSION_DELETE_FAILED)
      setIsDeleting(false)
    }
  }

  const handleDownload = async () => {
    if (!recording?.storageUrl) return

    try {
      const response = await fetch(recording.storageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${recording.title}.webm` // Assuming webm/wav
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
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
      header={<AppHeader showBackButton={true} onBack={handleBack} />}
      pageHeader={
        <div>
          <PageHeader
            title={recording.title}
            description="Listen back and analyze your flow"
          />
        </div>
      }
      alerts={error && <ErrorAlert error={error} onDismiss={clearError} />}
      player={
        <SessionPlayer
          audioUrl={recording.storageUrl}
          beatUrl={recording.beat?.storageUrl}
        />
      }
      metadata={<SessionMetadata recording={recording} />}
      actions={
        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={handleDownload}
            leftIcon={<Download size={18} />}
          >
            Download Audio
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
            leftIcon={<Trash2 size={18} />}
          >
            Delete Session
          </Button>
        </div>
      }
    />
  )
}

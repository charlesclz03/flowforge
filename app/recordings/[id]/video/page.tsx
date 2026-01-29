'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ReviewTemplate } from '@/components/templates/ReviewTemplate'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { Spinner } from '@/components/atoms/Spinner'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { FreestyleSessionWithBeat } from '@/types/database'
import { ErrorCodes } from '@/lib/errors'
import { VideoCreator } from '@/components/features/export/VideoCreator'

export default function VideoExportPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recording, setRecording] = useState<FreestyleSessionWithBeat | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
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
  const isPro = session?.user?.subscriptionStatus === 'active'
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
          <VideoCreator
            audioUrl={recording.storageUrl}
            title={recording.title}
            artist={recording.userId || 'User'}
            onBack={handleBack}
          />
        </div>
      }
      metadata={null}
      actions={null}
    />
  )
}

// Temporary Button import for error state
import { Button } from '@/components/atoms/Button'

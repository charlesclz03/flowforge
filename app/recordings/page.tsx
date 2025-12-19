'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Lock } from 'lucide-react'
import { PageHeader } from '@/components/organisms/common'
import { RecordingsList, RecordingsStats } from '@/components/organisms/recordings'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { Spinner } from '@/components/atoms/Spinner'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { ErrorCodes } from '@/lib/errors'
import { FreestyleSessionWithBeat } from '@/types/database'

export default function RecordingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recordings, setRecordings] = useState<FreestyleSessionWithBeat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { error, handleError, clearError } = useErrorHandler()

  const fetchRecordings = useCallback(async () => {
    setIsLoading(true)
    clearError()

    try {
      const response = await fetch('/api/recordings')
      if (!response.ok) {
        throw new Error('Failed to fetch recordings')
      }

      const data = await response.json()
      setRecordings(data.recordings || [])
    } catch (err) {
      handleError(err, ErrorCodes.FETCH_RECORDINGS_FAILED)
    } finally {
      setIsLoading(false)
    }
  }, [clearError, handleError])

  // Handle unauthenticated redirect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Fetch recordings when authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchRecordings()
    }
  }, [status, session, fetchRecordings])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/recordings/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete recording')
      }

      setRecordings((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      throw err
    }
  }

  const handleDownload = async (recording: FreestyleSessionWithBeat) => {
    if (!recording.storageUrl) {
      throw new Error('Recording URL not available')
    }

    try {
      const response = await fetch(recording.storageUrl)
      if (!response.ok) {
        throw new Error('Failed to download recording')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${recording.title}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      throw err
    }
  }

  // Show loading state while session is being checked
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  // If unauthenticated, we redirect in useEffect. Return null to avoid flash.
  if (status === 'unauthenticated') {
    return null
  }

  // Determine if user is pro
  const isPro =
    session?.user?.subscriptionStatus === 'active' ||
    session?.user?.subscriptionStatus === 'trialing'

  // If free user, show locked state
  if (!isPro) {
    return (
      <OnboardingLayout showBackButton={false} showSettings={true} className="bg-background">
        <div className="pt-8 pb-32 px-4">
          <PageHeader
            title="My Recordings"
            description="Upgrade to Pro to access your session history"
          />
          <div className="mt-12 text-center space-y-6 max-w-md mx-auto">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-text-tertiary" />
            </div>
            <h3 className="text-xl font-bold text-white">History Locked</h3>
            <p className="text-text-secondary">
              Free users can practice anytime, but access to past recordings is a Pro feature.
              Upgrade to unlock your full history, downloads, and more.
            </p>
            <button
              // We would trigger the modal here ideally, but for now just redirect or show nothing
              onClick={() => router.push('/profile')} // Or any upgrade path
              className="bg-accent-purple text-white px-8 py-3 rounded-full font-bold hover:bg-accent-purple/90 transition-colors"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout showBackButton={false} showSettings={true} className="bg-background">
      <div className="pt-8 pb-32">
        <PageHeader
          title="My Recordings"
          description="View, play, and download your practice sessions"
        />
        {error && <ErrorAlert error={error} onDismiss={clearError} />}

        <div className="mt-8 space-y-8">
          <RecordingsStats recordings={recordings} />
          <RecordingsList
            recordings={recordings}
            isLoading={isLoading}
            onDelete={handleDelete}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}

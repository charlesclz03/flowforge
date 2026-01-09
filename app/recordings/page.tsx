'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PageHeader } from '@/components/organisms/common'
import {
  RecordingsList,
  RecordingsStats,
} from '@/components/organisms/recordings'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'
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

  // If free user, show list but with blocked access modal
  return (
    <OnboardingLayout
      showBackButton={false}
      showSettings={true}
      className="bg-background"
    >
      <div className="pt-8 pb-32">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'My Rap Vault & Session History',
              operatingSystem: 'iOS, Android, Web',
              applicationCategory: 'MusicApplication',
              description:
                'Listen to your past freestyle sessions, analyze your word usage, and track your improvement over time.',
            }),
          }}
        />
        <PageHeader
          title="My Rap Vault & Session History"
          description="Listen to your past freestyle sessions, analyze your word usage, and track your improvement over time."
        />
        {error && <ErrorAlert error={error} onDismiss={clearError} />}

        <div className="mt-8 space-y-8 relative">
          {/* Blur content if not pro */}
          <div
            className={
              !isPro ? 'blur-sm pointer-events-none select-none opacity-50' : ''
            }
          >
            <RecordingsStats recordings={recordings} />
            <RecordingsList
              recordings={recordings}
              isLoading={isLoading}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          </div>

          {/* Overlaid Premium Modal for non-pro */}
          {!isPro && !isLoading && (
            <PremiumModal
              isOpen={true}
              onClose={() => router.push('/practice')}
              trigger="history"
            />
          )}
        </div>
      </div>
    </OnboardingLayout>
  )
}

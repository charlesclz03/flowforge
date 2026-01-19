'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

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
import { AudioMixer } from '@/lib/audio/mixer'
import { toast } from 'react-hot-toast'

import { StorageBar } from '@/components/organisms/recordings/StorageBar'

export default function RecordingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recordings, setRecordings] = useState<FreestyleSessionWithBeat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
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

    // If beat exists, OR if we want to apply studio FX to acapella, we use the mixer
    // For now, always use mixer to ensure Studio Reverb/Compression is applied if desired.
    // However, if no beat, we just mix voice with Studio FX.

    const toastId = toast.loading('Rendering Studio Quality...', {
      style: {
        background: '#333',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
      },
    })

    try {
      const mixer = new AudioMixer()
      // Mix with Studio FX (Reverb/Compression) enabled by default for "Production Ready" downloads
      const blob = await mixer.mix(
        recording.storageUrl,
        recording.beat?.storageUrl || null,
        {
          voiceVolume: 1.0,
          beatVolume: 0.8,
          isStudioMode: true, // List view always uses "Production Defaults" since there's no player UI here
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

      toast.success('Download ready!', { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error('Export failed. Please try again.', { id: toastId })
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

  // Calculate Storage Usage (Total Duration in Seconds)
  const totalUsedSeconds = recordings.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0)

  // If free user, show list but with blocked access modal
  return (
    <OnboardingLayout
      showBackButton={false}
      showSettings={true}
      className="bg-background"
      customTitle="TAPE DECK"
      customSubtitle="Your flow archive and mixed tracks"
    >
      {/* Responsive padding - less on small screens */}
      <div className="pt-4 sm:pt-8 w-full max-w-2xl mx-auto">
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

        {error && <ErrorAlert error={error} onDismiss={clearError} />}

        {/* Storage Bar (Above List) */}
        {!isLoading && (
            <StorageBar 
              usedSeconds={totalUsedSeconds} 
              isPro={isPro} 
              onUpgradeClick={() => setShowPremiumModal(true)}
            />
        )}

        <div className="mt-4 space-y-8 relative">
          <div className="opacity-100">
            <RecordingsStats recordings={recordings} />
            <RecordingsList
              recordings={recordings}
              isLoading={isLoading}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          </div>

          <PremiumModal
            isOpen={showPremiumModal}
            onClose={() => setShowPremiumModal(false)}
            trigger="recording" // Context adjusted
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProfileTemplate } from '@/components/templates'
import { PageHeader } from '@/components/organisms/common'
import {
  AccountInfo,
  SubscriptionSection,
  SecuritySection,
  StatsSection,
  QuickActions,
} from '@/components/organisms/profile'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { Spinner } from '@/components/atoms/Spinner'
import type { Recording } from '@/components/organisms/profile/StatsSection'
import { GuestStorage } from '@/lib/guest-storage'
import { SuccessAlert } from '@/components/molecules/feedback/SuccessAlert'
import { SocialsForm } from '@/components/organisms/profile/SocialsForm'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(true)
  const [restorationMessage, setRestorationMessage] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchRecordings() {
      try {
        const response = await fetch('/api/recordings')
        if (response.ok) {
          const data = await response.json()
          setRecordings(data.recordings || [])
        }
      } catch (error) {
        console.error('Failed to fetch recordings:', error)
      } finally {
        setIsLoadingRecordings(false)
      }
    }

    async function checkGuestSession() {
      if (!session?.user) return

      try {
        const guestSession = await GuestStorage.getSession()
        if (!guestSession) return

        const formData = new FormData()
        formData.append('audio', guestSession.blob, 'guest_recording.webm')
        formData.append('beatId', guestSession.metadata.beatId)
        formData.append('title', `${guestSession.metadata.beatTitle} - Guest Session`)
        formData.append('durationSeconds', guestSession.metadata.duration.toString())
        formData.append('frequency', guestSession.metadata.frequency.toString())
        formData.append('difficulty', guestSession.metadata.difficulty.toString())

        const response = await fetch('/api/recordings', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          await GuestStorage.clearSession()
          setRestorationMessage('Guest recording saved successfully! View it below.')
          setTimeout(() => setRestorationMessage(null), 5000)

          // Refresh list
          fetchRecordings()
        }
      } catch (error) {
        console.error('Failed to restore guest session:', error)
      }
    }

    if (session) {
      fetchRecordings()
      checkGuestSession()
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <ProfileTemplate
      header={<AppHeader />}
      pageHeader={
        <div className="space-y-4">
          <PageHeader title="Profile" description="Manage your account settings and preferences" />
          {restorationMessage && (
            <SuccessAlert
              message={restorationMessage}
              onDismiss={() => setRestorationMessage(null)}
            />
          )}
        </div>
      }
      accountInfo={<AccountInfo user={session.user} />}
      subscription={<SubscriptionSection />}
      security={<SecuritySection />}
      stats={<StatsSection recordings={recordings} isLoading={isLoadingRecordings} />}
      quickActions={
        <div className="space-y-8">
          <QuickActions />
          <SocialsForm />
        </div>
      }
    />
  )
}

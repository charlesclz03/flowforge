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
import { BadgesDisplay } from '@/components/organisms/profile/BadgesDisplay'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { Spinner } from '@/components/atoms/Spinner'
import type { Recording } from '@/components/organisms/profile/StatsSection'
import { GuestStorage } from '@/lib/guest-storage'
import { SuccessAlert } from '@/components/molecules/feedback/SuccessAlert'
import { SocialsForm } from '@/components/organisms/profile/SocialsForm'

import { EditProfileDialog } from '@/components/organisms/profile/EditProfileDialog'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(true)
  const [restorationMessage, setRestorationMessage] = useState<string | null>(null)

  // Edit Profile State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

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
      // ... (Guest session logic unchanged)
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

  const handleEditSuccess = async () => {
    await update() // Refresh session
    router.refresh()
  }

  return (
    <>
      <ProfileTemplate
        header={<AppHeader />}
        pageHeader={
          <div className="space-y-4">
            <PageHeader
              title="Profile"
              description="Manage your account settings and preferences"
            />
            {restorationMessage && (
              <SuccessAlert
                message={restorationMessage}
                onDismiss={() => setRestorationMessage(null)}
              />
            )}
          </div>
        }
        accountInfo={<AccountInfo user={session.user} onEdit={() => setIsEditProfileOpen(true)} />}
        subscription={<SubscriptionSection />}
        security={<SecuritySection />}
        stats={
          <div className="space-y-6">
            <StatsSection recordings={recordings} isLoading={isLoadingRecordings} />
            <BadgesDisplay badges={session.user.badges || []} />
          </div>
        }
        quickActions={
          <div className="space-y-8">
            <QuickActions />
            <SocialsForm initialSocials={session.user.socials || {}} />
          </div>
        }
      />

      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={session.user}
        onSuccess={handleEditSuccess}
      />
    </>
  )
}

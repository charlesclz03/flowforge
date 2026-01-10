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
// Removed BadgesDisplay and SocialsForm
// Removed AchievementsDisplay (Moved to Leaderboard)
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { Spinner } from '@/components/atoms/Spinner'
import type { Recording } from '@/components/organisms/profile/StatsSection'
import { GuestStorage } from '@/lib/guest-storage'
import { SuccessAlert } from '@/components/molecules/feedback/SuccessAlert'

import { EditProfileDialog } from '@/components/organisms/profile/EditProfileDialog'
import { AdminUploadSection } from '@/components/organisms/profile/AdminUploadSection'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [wordVaultCount, setWordVaultCount] = useState(0)
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(false)
  const [restorationMessage, setRestorationMessage] = useState<string | null>(
    null
  )

  // Edit Profile State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Fallback for stuck session loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading') {
        router.push('/')
      }
    }, 7000)
    return () => clearTimeout(timer)
  }, [status, router])

  useEffect(() => {
    async function fetchStats() {
      setIsLoadingRecordings(true)
      try {
        const [recRes, statsRes] = await Promise.all([
          fetch('/api/recordings'),
          fetch('/api/user/stats'),
        ])

        if (
          recRes.ok &&
          recRes.headers.get('content-type')?.includes('application/json')
        ) {
          const data = await recRes.json()
          setRecordings(data.recordings || [])
        } else {
          console.warn('Recordings fetch failed or non-JSON', {
            status: recRes.status,
          })
        }

        if (
          statsRes.ok &&
          statsRes.headers.get('content-type')?.includes('application/json')
        ) {
          const data = await statsRes.json()
          setWordVaultCount(data.wordVaultCount || 0)
        } else {
          console.warn('Stats fetch failed or non-JSON', {
            status: statsRes.status,
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoadingRecordings(false)
      }
    }

    if (session) {
      fetchStats()
    }
  }, [session])

  useEffect(() => {
    async function checkGuestSession() {
      if (!session?.user) return

      try {
        const guestSession = await GuestStorage.getSession()
        if (!guestSession) return

        const formData = new FormData()
        formData.append('audio', guestSession.blob, 'guest_recording.webm')
        formData.append('beatId', guestSession.metadata.beatId)
        formData.append(
          'title',
          `${guestSession.metadata.beatTitle} - Guest Session`
        )
        formData.append(
          'durationSeconds',
          guestSession.metadata.duration.toString()
        )
        formData.append('frequency', guestSession.metadata.frequency.toString())
        formData.append(
          'difficulty',
          guestSession.metadata.difficulty.toString()
        )

        const response = await fetch('/api/recordings', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          setRestorationMessage('Guest session restored to your account!')
          // Clear guest storage
          await GuestStorage.clearSession()
          // Refresh list
          const recRes = await fetch('/api/recordings')
          const data = await recRes.json()
          setRecordings(data.recordings || [])
        }
      } catch (err) {
        console.error('Failed to restore guest session', err)
      }
    }
    checkGuestSession()
  }, [session])

  if (status === 'loading') {
    return (
      <OnboardingLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </OnboardingLayout>
    )
  }

  if (!session?.user) return null

  return (
    <OnboardingLayout
      showBackButton={false}
      showSettings={false}
      className="bg-background pb-32"
    >
      {restorationMessage && (
        <div className="mx-auto max-w-md p-4">
          <SuccessAlert
            message={restorationMessage}
            onDismiss={() => setRestorationMessage(null)}
          />
        </div>
      )}

      <ProfileTemplate
        pageHeader={
          <div className="px-6 pt-8 pb-4">
            <PageHeader
              title="Profile"
              description="Your stats and settings."
            />
          </div>
        }
        accountInfo={
          <AccountInfo
            user={session.user}
            // Removed isPro prop as AccountInfo doesn't accept it
            onEdit={() => setIsEditProfileOpen(true)}
          />
        }
        subscription={<SubscriptionSection />}
        security={<SecuritySection />}
        stats={
          <div className="space-y-6">
            <StatsSection
              recordings={recordings}
              isLoading={isLoadingRecordings}
              wordVaultCount={wordVaultCount}
            />
            {/* Achievements moved to Leaderboard */}
          </div>
        }
        quickActions={
          <div className="space-y-8">
            <QuickActions />
          </div>
        }
        adminSection={
          session?.user?.role === 'SUPERADMIN' ? (
            <AdminUploadSection />
          ) : undefined
        }
      />

      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={session.user}
        onSuccess={update} // Renamed from onUpdate to onSuccess
      />
    </OnboardingLayout>
  )
}

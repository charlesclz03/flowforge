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
import { Trophy } from 'lucide-react'
import Link from 'next/link'
import { Spinner } from '@/components/atoms/Spinner'
import type { Recording } from '@/components/organisms/profile/StatsSection'
import { GuestStorage } from '@/lib/guest-storage'
import { SuccessAlert } from '@/components/molecules/feedback/SuccessAlert'
import { SocialsForm } from '@/components/organisms/profile/SocialsForm'
import { getRank } from '@/lib/gamification/ranks'

import { EditProfileDialog } from '@/components/organisms/profile/EditProfileDialog'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [wordVaultCount, setWordVaultCount] = useState(0)
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
    async function fetchStats() {
      try {
        const [recRes, statsRes] = await Promise.all([
          fetch('/api/recordings'),
          fetch('/api/user/stats'),
        ])

        if (recRes.ok) {
          const data = await recRes.json()
          setRecordings(data.recordings || [])
        }
        if (statsRes.ok) {
          const data = await statsRes.json()
          setWordVaultCount(data.wordVaultCount || 0)
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
          const res = await fetch('/api/recordings')
          if (res.ok) {
            const data = await res.json()
            setRecordings(data.recordings || [])
          }
        }
      } catch (error) {
        console.error('Failed to restore guest session:', error)
      }
    }

    if (session) {
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
        header={
          <div className="flex justify-end items-center p-4 gap-2 safe-top">
            <Link
              href="/leaderboard"
              className="p-2 text-text-secondary hover:text-accent-yellow transition-colors rounded-full hover:bg-white/5"
              aria-label="Leaderboard"
            >
              <Trophy size={20} />
            </Link>
          </div>
        }
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
        accountInfo={
          <AccountInfo
            user={session.user}
            rank={getRank(
              recordings.reduce((acc, rec) => acc + (rec.durationSeconds || 0), 0) / 60
            )}
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

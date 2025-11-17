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

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(true)

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

    if (session) {
      fetchRecordings()
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
        <PageHeader title="Profile" description="Manage your account settings and preferences" />
      }
      accountInfo={<AccountInfo user={session.user} />}
      subscription={<SubscriptionSection />}
      security={<SecuritySection />}
      stats={<StatsSection recordings={recordings} isLoading={isLoadingRecordings} />}
      quickActions={<QuickActions />}
    />
  )
}

'use client'

import { useEffect, useState } from 'react'
import {
  StatsSection,
  UserStats,
} from '@/components/organisms/profile/StatsSection'
import { useSession } from 'next-auth/react'
import { isProUser } from '@/lib/subscription/isPro'

export function ProfileStatsTab() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      if (!session?.user?.id) return

      setIsLoading(true)
      try {
        const res = await fetch('/api/user/stats')

        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [session?.user?.id])

  const isPro = isProUser(session?.user)

  return <StatsSection stats={stats} isLoading={isLoading} isPro={isPro} />
}

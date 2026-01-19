'use client'

import { useEffect, useState } from 'react'
import { StatsSection, Recording } from '@/components/organisms/profile/StatsSection'
import { useSession } from 'next-auth/react'

export function ProfileStatsTab() {
  const { data: session } = useSession()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [wordVaultCount, setWordVaultCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      if (!session?.user?.id) return
      
      setIsLoading(true)
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
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [session?.user?.id])

  return (
    <StatsSection
      recordings={recordings}
      isLoading={isLoading}
      wordVaultCount={wordVaultCount}
    />
  )
}

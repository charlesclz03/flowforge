'use client'

import { Card } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { StatCard } from '@/components/molecules/display/StatCard'

export interface Recording {
  id: string
  beatId: string
  durationSeconds: number
}

interface StatsSectionProps {
  recordings: Recording[]
  isLoading: boolean
}

export function StatsSection({ recordings, isLoading }: StatsSectionProps) {
  return (
    <Card title="Your Stats">
      {isLoading ? (
        <div className="py-8 text-center">
          <Spinner size="md" className="mx-auto" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total Recordings" value={recordings.length} variant="compact" />
          <StatCard
            label="Minutes Practiced"
            value={Math.floor(
              recordings.reduce((total, r) => total + (r.durationSeconds || 0), 0) / 60
            )}
            variant="compact"
          />
          <StatCard
            label="Unique Beats"
            value={new Set(recordings.map((r) => r.beatId)).size}
            variant="compact"
          />
          <StatCard
            label="Current Streak"
            value={recordings.length > 0 ? '🔥' : '—'}
            variant="compact"
          />
        </div>
      )}
    </Card>
  )
}

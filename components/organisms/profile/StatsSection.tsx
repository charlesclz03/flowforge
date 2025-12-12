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

      {/* Empty State Requirements: "Your legacy starts today..." */}
      {!isLoading && recordings.length === 0 && (
        <div className="mt-6 p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-xl">
          <h3 className="text-xl font-light text-white mb-2">Your legacy starts today.</h3>
          <p className="text-text-secondary">Record your first track.</p>
        </div>
      )}
    </Card>
  )
}

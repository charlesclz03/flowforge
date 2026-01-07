'use client'

import { Card } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { StatCard } from '@/components/molecules/display/StatCard'
import { HistoryGraph } from './HistoryGraph'
import { Trophy } from 'lucide-react'

export interface Recording {
  id: string
  beatId: string
  durationSeconds: number
  createdAt: string
}

interface StatsSectionProps {
  recordings: Recording[]
  isLoading: boolean
  wordVaultCount?: number
}

export function StatsSection({
  recordings,
  isLoading,
  wordVaultCount = 0,
}: StatsSectionProps) {
  const totalMinutes = Math.floor(
    recordings.reduce((total, r) => total + (r.durationSeconds || 0), 0) / 60
  )

  const flowDensity =
    totalMinutes > 0 ? Math.round(wordVaultCount / totalMinutes) : 0

  if (!isLoading && recordings.length === 0) {
    return (
      <Card title="Your Stats">
        <div className="py-12 text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent-purple/10 text-accent-purple">
            <Trophy size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white italic">
              "Your legacy starts today."
            </h3>
            <p className="text-text-secondary">
              Record your first track to see your stats grow.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card title="Your Stats">
      {isLoading ? (
        <div className="py-8 text-center">
          <Spinner size="md" className="mx-auto" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Recordings"
            value={recordings.length}
            variant="compact"
          />
          <StatCard
            label="Minutes Practiced"
            value={totalMinutes}
            variant="compact"
          />
          <StatCard
            label="Flow Density"
            value={`${flowDensity} wpm`}
            variant="compact"
            className="text-accent-cyan"
          />
          <StatCard
            label="Word Vault"
            value={`${wordVaultCount} / 2000`}
            variant="compact"
          />
        </div>
      )}

      {!isLoading && recordings.length > 0 && (
        <div className="mt-4 h-64">
          <HistoryGraph recordings={recordings} />
        </div>
      )}
    </Card>
  )
}

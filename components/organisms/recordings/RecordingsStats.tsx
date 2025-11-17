'use client'

import { Card } from '@/components/atoms/Card'
import { FreestyleSessionWithBeat } from '@/types/database'

interface RecordingsStatsProps {
  recordings: FreestyleSessionWithBeat[]
}

export function RecordingsStats({ recordings }: RecordingsStatsProps) {
  if (recordings.length === 0) return null

  return (
    <Card title="Statistics">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-stroke-subtle/20 bg-background-elevated/50 p-4 text-center">
          <p className="text-3xl font-light text-white">{recordings.length}</p>
          <p className="mt-1 text-sm text-text-secondary">Total Recordings</p>
        </div>
        <div className="rounded-xl border border-stroke-subtle/20 bg-background-elevated/50 p-4 text-center">
          <p className="text-3xl font-light text-white">
            {Math.floor(recordings.reduce((sum, r) => sum + r.durationSeconds, 0) / 60)}
          </p>
          <p className="mt-1 text-sm text-text-secondary">Total Minutes</p>
        </div>
        <div className="rounded-xl border border-stroke-subtle/20 bg-background-elevated/50 p-4 text-center">
          <p className="text-3xl font-light text-white">
            {new Set(recordings.map((r) => r.beatId)).size}
          </p>
          <p className="mt-1 text-sm text-text-secondary">Unique Beats</p>
        </div>
      </div>
    </Card>
  )
}

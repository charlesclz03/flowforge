'use client'

import { Card } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { StatCard } from '@/components/molecules/display/StatCard'
import { HistoryGraph } from './HistoryGraph'
import { Trophy, Lock } from 'lucide-react'

export interface UserStats {
  wordVaultCount: number
  totalSessions: number
  totalDuration: number // minutes
  historyCurve: { date: string; count: number; label: string }[]
}

interface StatsSectionProps {
  stats: UserStats | null
  isLoading: boolean
  isPro?: boolean
}

export function StatsSection({
  stats,
  isLoading,
  isPro = false,
}: StatsSectionProps) {
  const flowDensity =
    stats && stats.totalDuration > 0
      ? Math.round(stats.wordVaultCount / stats.totalDuration)
      : 0

  if (!isLoading && (!stats || stats.totalSessions === 0)) {
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
      {isLoading || !stats ? (
        <div className="py-8 text-center">
          <Spinner size="md" className="mx-auto" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Recordings"
            value={stats.totalSessions}
            variant="compact"
          />
          <StatCard
            label="Minutes Practiced"
            value={stats.totalDuration}
            variant="compact"
          />
          <StatCard
            label="Vocab Velocity"
            value={`${flowDensity} wpm`}
            variant="compact"
            className="text-accent-cyan"
          />
          <StatCard
            label="Word Vault"
            value={`${stats.wordVaultCount} / 2000`}
            variant="compact"
          />
        </div>
      )}

      {!isLoading && stats && stats.historyCurve && isPro && (
        <div className="mt-4 h-64">
          <HistoryGraph data={stats.historyCurve} />
        </div>
      )}

      {/* Pro Teaser for Free Users */}
      {!isLoading && !isPro && (
        <div className="mt-4 h-40 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
          {/* Faux graph bars background */}
          <div className="absolute inset-0 flex items-end justify-between px-4 pb-2 opacity-20 blur-[2px]">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="bg-accent-purple w-2 rounded-t-sm"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
          </div>

          <div className="relative z-20 text-center p-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent-purple/20 text-accent-purple mb-2">
              <Lock size={18} />
            </div>
            <h4 className="font-bold text-white text-sm">
              Unlock History Graph
            </h4>
            <p className="text-xs text-text-tertiary mt-1 mb-3">
              Track your consistency over time with Pro.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}

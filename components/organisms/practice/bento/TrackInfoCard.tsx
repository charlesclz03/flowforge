'use client'

import { BentoCard } from '@/components/atoms/BentoGrid'
import { Disc3 } from 'lucide-react'
import { Beat } from '@/types/database'
import { cn } from '@/lib/utils'

interface TrackInfoCardProps {
  beat: Beat | null
  difficulty?: string
  bpm?: number
  className?: string
}

export function TrackInfoCard({ beat, difficulty, bpm, className }: TrackInfoCardProps) {
  if (!beat) return null

  // Use prop bpm if provided, fallback to beat.bpm
  const displayBpm = bpm || beat.bpm

  return (
    <BentoCard
      title="Track Data"
      icon={
        <Disc3
          size={16}
          className={cn('text-accent-pink', displayBpm > 0 && 'animate-spin-slow')}
        />
      }
      className={cn('col-span-1 md:col-span-2 lg:col-span-3', className)}
    >
      <div className="flex-1 flex flex-col justify-center gap-3">
        <div className="space-y-1">
          <h3 className="font-bold text-white truncate text-lg pr-4">{beat.title}</h3>
          <p className="text-sm text-text-secondary truncate">
            {beat.artistName || 'Unknown Artist'}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-auto">
          <span className="px-2 py-1 rounded-md bg-white/10 text-xs font-mono font-bold text-accent-cyan border border-white/5">
            {displayBpm} BPM
          </span>
          {difficulty && (
            <span
              className={cn(
                'px-2 py-1 rounded-md text-xs font-mono font-bold border',
                difficulty === 'Easy' && 'bg-green-500/10 text-green-400 border-green-500/20',
                difficulty === 'Medium' && 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                difficulty === 'Hard' && 'bg-red-500/10 text-red-400 border-red-500/20',
                !['Easy', 'Medium', 'Hard'].includes(difficulty) &&
                  'bg-white/10 text-text-secondary border-white/5'
              )}
            >
              {difficulty}
            </span>
          )}
          {beat.genre && (
            <span className="px-2 py-1 rounded-md bg-white/10 text-xs font-mono font-bold text-text-secondary border border-white/5">
              {beat.genre}
            </span>
          )}
        </div>
      </div>
    </BentoCard>
  )
}

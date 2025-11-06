'use client'

import { Beat } from '@/types/database'
import { cn } from '@/lib/utils'
import { Music, Zap } from 'lucide-react'

interface BeatCardProps {
  beat: Beat
  isSelected: boolean
  onSelect: (beat: Beat) => void
  className?: string
}

export function BeatCard({ beat, isSelected, onSelect, className }: BeatCardProps) {
  return (
    <button
      onClick={() => onSelect(beat)}
      className={cn(
        'w-full p-4 rounded-xl transition-all',
        'border-2',
        'text-left',
        'hover:scale-[1.02] active:scale-[0.98]',
        isSelected
          ? 'border-accent-orange bg-accent-orange/10'
          : 'border-text-tertiary/20 bg-background-card hover:border-text-tertiary/40',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg',
              isSelected
                ? 'bg-accent-orange text-black'
                : 'bg-background-elevated text-text-secondary'
            )}
          >
            <Music size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                'font-medium truncate',
                isSelected ? 'text-text-primary' : 'text-text-primary'
              )}
            >
              {beat.title}
            </h3>
            <p className="text-text-secondary text-sm">
              {beat.bpm} BPM {beat.genre && `· ${beat.genre}`}
            </p>
          </div>
        </div>

        {beat.isPremium && (
          <div className="flex items-center space-x-1 text-accent-orange text-xs">
            <Zap size={14} />
            <span>Pro</span>
          </div>
        )}
      </div>
    </button>
  )
}

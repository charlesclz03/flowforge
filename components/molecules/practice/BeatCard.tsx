'use client'

import { memo } from 'react'
import { Beat } from '@/types/database'
import { cn } from '@/lib/utils'
import { Music, Check, Crown, Heart } from 'lucide-react'

interface BeatCardProps {
  beat: Beat
  isSelected: boolean
  isLocked?: boolean
  isFavorite?: boolean
  onSelect: (beat: Beat) => void
  onToggleFavorite?: (beatId: string) => void
  className?: string
}

export const BeatCard = memo(function BeatCard({
  beat,
  isSelected,
  isLocked = false,
  isFavorite = false,
  onSelect,
  onToggleFavorite,
  className,
}: BeatCardProps) {
  return (
    <button
      onClick={() => !isLocked && onSelect(beat)}
      disabled={isLocked}
      className={cn(
        'w-full p-4 rounded-xl transition-all relative',
        'border-2',
        'text-left',
        'hover:scale-[1.02] active:scale-[0.98]',
        isSelected
          ? 'border-accent-purple bg-accent-purple/10'
          : isLocked
            ? 'border-transparent bg-background-elevated/50 opacity-60 cursor-not-allowed'
            : 'border-text-tertiary/20 bg-background-card hover:border-text-tertiary/40',
        className
      )}
    >
      {/* Selected checkmark in top-right */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent-purple flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg',
              isSelected
                ? 'bg-accent-purple text-white'
                : 'bg-background-elevated text-text-secondary'
            )}
          >
            <Music size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate text-text-primary">{beat.title}</h3>
            <p className="text-text-secondary text-sm">
              {beat.bpm} BPM {beat.genre && `• ${beat.genre}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Favorite Button (Stop propagation to prevent selection) */}
        {onToggleFavorite && !isLocked && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(beat.id)
            }}
            className={cn(
              'p-2 rounded-full transition-colors z-10',
              isFavorite
                ? 'text-red-500 hover:bg-red-500/10'
                : 'text-text-tertiary hover:text-text-primary hover:bg-white/5'
            )}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}

        {beat.isPremium && (
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-accent-orange/20 text-accent-orange text-xs font-medium">
            <Crown size={12} />
            <span>Premium</span>
          </div>
        )}

        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-xl">
            {/* Optional: Lock icon overlay if desired, but opacity might be enough */}
          </div>
        )}
      </div>
    </button>
  )
})

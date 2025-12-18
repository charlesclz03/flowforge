'use client'

import { memo } from 'react'
import { Beat } from '@/types/database'
import { cn } from '@/lib/utils'
import { Music, Check, Crown } from 'lucide-react'

interface BeatCardProps {
  beat: Beat
  isSelected: boolean
  isLocked?: boolean
  onSelect: (beat: Beat) => void
  className?: string
}

export const BeatCard = memo(function BeatCard({
  beat,
  isSelected,
  isFavorited = false,
  isLocked = false,
  onSelect,
  onToggleFavorite,
  className,
}: BeatCardProps & { isFavorited?: boolean; onToggleFavorite?: (beatId: string) => void }) {
  return (
    <div className="relative group">
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
              <h3 className="font-medium truncate text-text-primary mr-8">{beat.title}</h3>
              <p className="text-text-secondary text-sm">
                {beat.bpm} BPM {beat.genre && `• ${beat.genre}`}
              </p>
            </div>
          </div>

          {beat.isPremium && (
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-accent-orange/20 text-accent-orange text-xs font-medium mr-2">
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

      {/* Favorite Button (Outside the main click area but positioned absolute) */}
      {!isLocked && onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(beat.id)
          }}
          className="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-text-secondary hover:text-accent-pink transition-colors z-10"
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <div className={cn("transition-transform active:scale-90", isFavorited && "text-accent-pink")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isFavorited ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
        </button>
      )}
    </div>
  )
})

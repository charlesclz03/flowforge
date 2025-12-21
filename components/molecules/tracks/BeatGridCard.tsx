'use client'

import { Beat } from '@/types/database'
import { Play, Square, Heart, Crown, Music, Lock, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface BeatGridCardProps {
  beat: Beat
  isSelected?: boolean
  isPlaying?: boolean
  isFavorited?: boolean
  isLocked?: boolean
  onPlay: () => void
  onSelect: () => void
  onToggleFavorite: (e: React.MouseEvent) => void
  onDelete?: (e: React.MouseEvent) => void
}

export function BeatGridCard({
  beat,
  isSelected,
  isPlaying,
  isFavorited,
  isLocked,
  onPlay,
  onSelect,
  onToggleFavorite,
  onDelete,
}: BeatGridCardProps) {
  // Placeholder gradients based on genre or random
  const gradients = [
    'from-purple-500 to-indigo-600',
    'from-pink-500 to-rose-500',
    'from-blue-400 to-cyan-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
  ]
  const randomGradient = gradients[beat.title.length % gradients.length]

  return (
    <div
      onClick={isLocked ? undefined : onSelect}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer',
        isSelected
          ? 'border-accent-purple bg-accent-purple/10 ring-1 ring-accent-purple/50'
          : 'border-white/10 bg-[#121216] hover:border-white/20 hover:bg-[#18181E] hover:-translate-y-1',
        isLocked && 'cursor-not-allowed opacity-80'
      )}
    >
      {/* Cover Art Area */}
      <div
        className={cn(
          'relative aspect-square w-full overflow-hidden bg-gradient-to-br',
          randomGradient
        )}
      >
        {beat.coverImage ? (
          <Image
            src={beat.coverImage}
            alt={beat.title}
            fill
            className={cn(
              'object-cover transition-transform duration-500',
              !isLocked && 'group-hover:scale-110'
            )}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Music className="w-12 h-12 text-white/50" />
          </div>
        )}

        {/* Overlay on hover/playing/locked */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-300',
            (isPlaying || isSelected) && !isLocked
              ? 'bg-black/40 backdrop-blur-sm'
              : 'bg-black/0 opacity-0 group-hover:opacity-100 group-hover:bg-black/30',
            isLocked && 'bg-black/60 opacity-100'
          )}
        >
          {isLocked ? (
            <div className="flex flex-col items-center justify-center text-white/70 gap-2">
              <Lock size={24} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Locked</span>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPlay()
              }}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95',
                isPlaying ? 'bg-accent-purple text-white' : 'bg-white text-black'
              )}
            >
              {isPlaying ? (
                <Square size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" className="ml-1" />
              )}
            </button>
          )}
        </div>

        {/* Premium Badge */}
        {beat.isPremium && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-accent-orange backdrop-blur-md border border-accent-orange/20">
            <Crown size={10} />
            {isLocked ? <span>PREMIUM</span> : <span>PRO</span>}
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className={cn('flex flex-col p-4', isLocked && 'opacity-50')}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                'truncate font-semibold',
                isSelected ? 'text-accent-purple' : 'text-white'
              )}
            >
              {beat.title}
            </h3>
            <p className="truncate text-xs text-text-secondary">
              {beat.artistName || 'FreeStyla Originals'}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(e)
                }}
                className="group/del p-1 text-text-tertiary hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={onToggleFavorite}
              disabled={isLocked}
              className={cn(
                'group/fav p-1 transition-colors',
                isFavorited ? 'text-accent-pink' : 'text-text-tertiary hover:text-accent-pink',
                isLocked && 'pointer-events-none opacity-0'
              )}
            >
              <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-text-secondary border border-white/5">
            {beat.bpm} BPM
          </span>
          {beat.genre && (
            <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-text-secondary border border-white/5">
              {beat.genre}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

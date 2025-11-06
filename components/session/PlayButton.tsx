'use client'

import { Play, Square } from 'lucide-react'
import { TimerRing } from '@/components/ui/TimerRing'
import { cn } from '@/lib/utils'

interface PlayButtonProps {
  isPlaying: boolean
  progress: number // 0 to 1
  onToggle: () => void
  disabled?: boolean
  size?: number
}

export function PlayButton({
  isPlaying,
  progress,
  onToggle,
  disabled = false,
  size = 200,
}: PlayButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Timer Ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <TimerRing progress={progress} size={size} />
      </div>

      {/* Play/Stop Button */}
      <button
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          'relative z-10 flex items-center justify-center rounded-full transition-all',
          'bg-accent-orange text-black',
          'hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-4 focus:ring-accent-orange/30',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          'shadow-lg shadow-accent-orange/20'
        )}
        style={{
          width: size * 0.65,
          height: size * 0.65,
        }}
        aria-label={isPlaying ? 'Stop' : 'Play'}
      >
        {isPlaying ? (
          <Square size={size * 0.2} fill="currentColor" />
        ) : (
          <Play size={size * 0.25} fill="currentColor" className="ml-1" />
        )}
      </button>

      {/* Pulsing indicator when playing */}
      {isPlaying && (
        <div
          className="absolute inset-0 rounded-full bg-accent-orange/20 animate-pulse-slow"
          style={{
            width: size * 0.7,
            height: size * 0.7,
            margin: 'auto',
          }}
        />
      )}
    </div>
  )
}

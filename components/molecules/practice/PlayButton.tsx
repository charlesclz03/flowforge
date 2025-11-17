'use client'

import { Play, Square } from 'lucide-react'
import { TimerRing } from '@/components/atoms/TimerRing'
import { cn } from '@/lib/utils'
import { UI_CONFIG } from '@/lib/constants/design'

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
  const buttonSize = size * UI_CONFIG.PLAY_BUTTON_SIZE_RATIO
  const iconSize = isPlaying
    ? size * UI_CONFIG.STOP_ICON_SIZE_RATIO
    : size * UI_CONFIG.PLAY_ICON_SIZE_RATIO

  return (
    <div
      className="relative flex items-center justify-center w-full h-full"
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      {/* Timer Ring */}
      <TimerRing progress={progress} size={size} className="absolute" />

      {/* Play/Stop Button - Purple with glow effect */}
      <button
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          'relative z-10 flex items-center justify-center rounded-full transition-all',
          'bg-accent-purple text-white',
          'hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-4 focus:ring-accent-purple/30',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          'shadow-purple'
        )}
        style={{
          width: buttonSize,
          height: buttonSize,
        }}
        aria-label={isPlaying ? 'Stop' : 'Play'}
      >
        {isPlaying ? (
          <Square size={iconSize} fill="currentColor" />
        ) : (
          <Play size={iconSize} fill="currentColor" className="ml-1" />
        )}
      </button>

      {/* Pulsing indicator when playing */}
      {isPlaying && (
        <div
          className="absolute rounded-full bg-accent-purple/20 animate-pulse-slow pointer-events-none"
          style={{
            width: buttonSize * 1.1,
            height: buttonSize * 1.1,
          }}
        />
      )}
    </div>
  )
}

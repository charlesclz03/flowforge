'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface SessionSettingsProps {
  ttsEnabled: boolean
  ttsVolume: number
  onTTSEnabledChange: (enabled: boolean) => void
  onTTSVolumeChange: (volume: number) => void
  className?: string
}

export function SessionSettings({
  ttsEnabled,
  ttsVolume,
  onTTSEnabledChange,
  onTTSVolumeChange,
  className,
}: SessionSettingsProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md',
        className
      )}
    >
      {/* TTS Toggle */}
      <button
        onClick={() => onTTSEnabledChange(!ttsEnabled)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
          ttsEnabled
            ? 'bg-accent-purple/20 text-accent-purple ring-1 ring-accent-purple/50'
            : 'bg-white/5 text-text-secondary hover:bg-white/10'
        )}
      >
        {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        <span>Voice Prompt</span>
      </button>

      {/* Volume Slider */}
      <div className="flex items-center gap-3 w-32 group">
        <Volume2 size={14} className="text-text-tertiary" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={ttsVolume}
          onChange={(e) => onTTSVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white group-hover:[&::-webkit-slider-thumb]:bg-accent-purple transition-all"
        />
      </div>
    </div>
  )
}

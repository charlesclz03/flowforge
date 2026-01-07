'use client'

import { BentoCard } from '@/components/atoms/BentoGrid'
import { Activity, Play, Square } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface VisualizerCardProps {
  visualizer: ReactNode
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
  disabled?: boolean
  className?: string
}

export function VisualizerCard({
  visualizer,
  isPlaying,
  onPlay,
  onStop,
  disabled,
  className,
}: VisualizerCardProps) {
  return (
    <BentoCard
      title="Voice Input"
      icon={<Activity size={16} className="text-accent-green" />}
      className={cn(
        'col-span-1 md:col-span-2 lg:col-span-3 min-h-[180px]',
        className
      )}
    >
      <div className="absolute inset-0 pt-12 px-2 pb-2">
        <div className="w-full h-full bg-black/20 rounded-xl overflow-hidden border border-white/5 relative group">
          {visualizer}
          {/* Scanlines Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10" />

          {/* Controls Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            {isPlaying ? (
              <button
                onClick={onStop}
                className="h-16 w-16 rounded-full bg-red-500/20 border border-red-500/50 text-red-500 flex items-center justify-center hover:bg-red-500/30 hover:scale-110 transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-sm"
              >
                <Square size={24} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={onPlay}
                disabled={disabled}
                className={cn(
                  'px-8 py-4 rounded-full flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-lg backdrop-blur-md',
                  disabled
                    ? 'bg-white/5 text-text-tertiary cursor-not-allowed border border-white/5'
                    : 'bg-accent-purple/90 text-white shadow-purple border border-white/20 hover:bg-accent-purple'
                )}
              >
                <Play size={24} fill="currentColor" />
                <span className="font-bold text-lg">START</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </BentoCard>
  )
}

'use client'

import { Mic } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface RecordingIndicatorProps {
  isRecording: boolean
  duration: number // in seconds
  maxDuration?: number | null
  className?: string
  showDuration?: boolean
  isPro?: boolean
}

export function RecordingIndicator({
  isRecording,
  duration,
  maxDuration,
  className,
  showDuration = true,
  isPro = false,
}: RecordingIndicatorProps) {
  // Only show the active red state if user is Pro
  const isActive = isRecording && isPro

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            'h-4 w-4 rounded-full transition-colors',
            isActive
              ? 'bg-accent-red pulse-record'
              : isRecording
                ? 'bg-white/50'
                : 'bg-text-tertiary'
          )}
        />
        <Mic
          size={20}
          className={cn(
            'transition-colors',
            isActive ? 'text-accent-red' : isRecording ? 'text-white/50' : 'text-text-tertiary'
          )}
        />
        {showDuration && (
          <div className="text-xs font-mono text-text-secondary">
            {formatDuration(Math.max(0, Math.round(duration)))}{' '}
            {maxDuration ? ` / ${formatDuration(Math.round(maxDuration))}` : ''}
          </div>
        )}
      </div>
    </div>
  )
}

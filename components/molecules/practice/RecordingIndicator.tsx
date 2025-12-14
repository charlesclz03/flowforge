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
}

export function RecordingIndicator({
  isRecording,
  duration,
  maxDuration,
  className,
  showDuration = true,
}: RecordingIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            'h-4 w-4 rounded-full transition-colors',
            isRecording ? 'bg-accent-red pulse-record' : 'bg-text-tertiary'
          )}
        />
        <Mic
          size={20}
          className={cn(
            'transition-colors',
            isRecording ? 'text-accent-red' : 'text-text-tertiary'
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

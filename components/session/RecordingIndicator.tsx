'use client'

import { Mic } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface RecordingIndicatorProps {
  isRecording: boolean
  duration: number // in seconds
  maxDuration?: number | null
  className?: string
}

export function RecordingIndicator({
  isRecording,
  duration,
  maxDuration,
  className,
}: RecordingIndicatorProps) {
  const percentage = maxDuration ? (duration / maxDuration) * 100 : 0
  const isNearLimit = maxDuration && duration >= maxDuration * 0.9

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-accent-red pulse-record" />
              <Mic size={16} className="text-accent-red" />
            </div>
          )}
          <span
            className={cn(
              'text-sm font-mono',
              isRecording ? 'text-accent-red' : 'text-text-secondary'
            )}
          >
            {formatDuration(duration)}
          </span>
        </div>

        {maxDuration && (
          <span className={cn('text-xs', isNearLimit ? 'text-accent-red' : 'text-text-tertiary')}>
            {formatDuration(maxDuration - duration)} left
          </span>
        )}
      </div>

      {maxDuration && (
        <div className="h-1 bg-background-elevated rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300',
              isNearLimit ? 'bg-accent-red' : 'bg-accent-orange'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

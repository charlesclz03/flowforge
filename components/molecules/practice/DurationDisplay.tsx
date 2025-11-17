'use client'

import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DurationDisplayProps {
  duration: number // in seconds
  label?: string
  large?: boolean
  className?: string
}

export function DurationDisplay({
  duration,
  label = 'Duration',
  large = false,
  className,
}: DurationDisplayProps) {
  return (
    <div className={cn('flex flex-col items-center space-y-1', className)}>
      {label && <div className="text-text-secondary text-xs uppercase tracking-wider">{label}</div>}
      <div
        className={cn('font-mono font-light', large ? 'text-4xl' : 'text-2xl', 'text-text-primary')}
      >
        {formatDuration(duration)}
      </div>
    </div>
  )
}

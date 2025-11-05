'use client'

import { SESSION_CONFIG } from '@/lib/constants/design'
import { cn } from '@/lib/utils'

interface FrequencySelectorProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

export function FrequencySelector({ value, onChange, className }: FrequencySelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm text-text-secondary">Word Frequency</label>
      <div className="grid grid-cols-3 gap-2">
        {SESSION_CONFIG.FREQUENCY_OPTIONS.map((freq) => (
          <button
            key={freq}
            onClick={() => onChange(freq)}
            className={cn(
              'py-3 rounded-xl font-medium transition-all',
              'border-2',
              value === freq
                ? 'border-accent-orange bg-accent-orange/10 text-text-primary'
                : 'border-text-tertiary/20 bg-background-card text-text-secondary hover:border-text-tertiary/40'
            )}
          >
            {freq} bars
          </button>
        ))}
      </div>
      <p className="text-xs text-text-tertiary">
        New word appears every {value} bars
      </p>
    </div>
  )
}


'use client'

import { SESSION_CONFIG } from '@/lib/constants/design'
import { cn } from '@/lib/utils'

interface DifficultySelectorProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

const difficultyColors = {
  1: {
    border: 'border-accent-green',
    bg: 'bg-accent-green/10',
    text: 'text-accent-green',
  },
  2: {
    border: 'border-accent-orange',
    bg: 'bg-accent-orange/10',
    text: 'text-accent-orange',
  },
  3: {
    border: 'border-accent-red',
    bg: 'bg-accent-red/10',
    text: 'text-accent-red',
  },
}

export function DifficultySelector({ value, onChange, className }: DifficultySelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm text-text-secondary">Difficulty</label>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(SESSION_CONFIG.DIFFICULTY_LABELS).map(([level, label]) => {
          const numLevel = parseInt(level)
          const colors = difficultyColors[numLevel as 1 | 2 | 3]
          const isSelected = value === numLevel

          return (
            <button
              key={level}
              onClick={() => onChange(numLevel)}
              className={cn(
                'py-3 rounded-xl font-medium transition-all',
                'border-2',
                isSelected
                  ? `${colors.border} ${colors.bg} ${colors.text}`
                  : 'border-text-tertiary/20 bg-background-card text-text-secondary hover:border-text-tertiary/40'
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-text-tertiary">
        {value === 1 && '1-2 syllable words'}
        {value === 2 && '2-3 syllable words'}
        {value === 3 && '3+ syllable words'}
      </p>
    </div>
  )
}

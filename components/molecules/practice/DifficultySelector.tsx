'use client'

import { SESSION_CONFIG } from '@/lib/constants/design'
import { cn } from '@/lib/utils'

interface DifficultySelectorProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

export function DifficultySelector({
  value,
  onChange,
  disabled = false,
  className,
}: DifficultySelectorProps) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value))
  }

  const badgeClasses =
    value === 1
      ? 'bg-accent-green/20 text-accent-green'
      : value === 2
        ? 'bg-accent-purple/20 text-accent-purple'
        : value === 3
          ? 'bg-accent-red/20 text-accent-red'
          : 'bg-accent-purple/20 text-accent-purple' // Random uses purple same as logo

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <label className="text-base text-text-primary">Difficulty</label>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            badgeClasses
          )}
        >
          {SESSION_CONFIG.DIFFICULTY_LABELS[value as 1 | 2 | 3 | 4]}
        </span>
      </div>

      <input
        type="range"
        min="1"
        max="4"
        step="1"
        value={value}
        onChange={handleSliderChange}
        disabled={disabled}
        className={cn(
          'w-full h-2 rounded-full appearance-none cursor-pointer',
          'bg-text-tertiary/20',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-purple',
          '[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg',
          '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5',
          '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent-purple',
          '[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{
          background: `linear-gradient(to right, #7D7AFF 0%, #7D7AFF ${((value - 1) / 3) * 100}%, rgba(255,255,255,0.1) ${((value - 1) / 3) * 100}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />
    </div>
  )
}

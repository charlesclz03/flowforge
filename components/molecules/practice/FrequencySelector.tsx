'use client'

import { SESSION_CONFIG } from '@/lib/constants/design'
import { cn } from '@/lib/utils'

interface FrequencySelectorProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

const frequencyLabels: Record<number, string> = {
  4: 'Every 4 bars',
  8: 'Every 8 bars',
  16: 'Every 16 bars',
}

const frequencyDescriptions: Record<number, string> = {
  4: 'New word every 4 bars - fast-paced',
  8: 'New word every 8 bars - balanced',
  16: 'New word every 16 bars - relaxed',
}

export function FrequencySelector({
  value,
  onChange,
  disabled = false,
  className,
}: FrequencySelectorProps) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value)
    onChange(SESSION_CONFIG.FREQUENCY_OPTIONS[index])
  }

  const currentIndex = SESSION_CONFIG.FREQUENCY_OPTIONS.indexOf(value as 4 | 8 | 16)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <label className="text-base text-text-primary">Word Frequency</label>
        <span className="px-3 py-1 rounded-full bg-accent-purple/20 text-accent-purple text-sm font-medium whitespace-nowrap">
          {frequencyLabels[value]}
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="2"
        step="1"
        value={currentIndex}
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
          background: `linear-gradient(to right, #7D7AFF 0%, #7D7AFF ${(currentIndex / 2) * 100}%, rgba(255,255,255,0.1) ${(currentIndex / 2) * 100}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />

      <p className="text-xs text-text-tertiary">{frequencyDescriptions[value]}</p>
    </div>
  )
}

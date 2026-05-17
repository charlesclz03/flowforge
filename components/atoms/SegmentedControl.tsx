'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SegmentedControlOption<T extends string | number> {
  value: T
  label: ReactNode
  description?: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

interface SegmentedControlProps<T extends string | number> {
  value: T
  options: SegmentedControlOption<T>[]
  onChange: (value: T) => void
  label: string
  className?: string
  optionClassName?: string
  columns?: 'auto' | 2 | 3 | 4
}

export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  label,
  className,
  optionClassName,
  columns = 'auto',
}: SegmentedControlProps<T>) {
  const gridClass =
    columns === 'auto'
      ? 'grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]'
      : {
          2: 'grid-cols-2',
          3: 'grid-cols-3',
          4: 'grid-cols-2 sm:grid-cols-4',
        }[columns]

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
        {label}
      </p>
      <div
        className={cn('grid gap-2', gridClass)}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const isActive = option.value === value
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={option.disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'min-h-[58px] rounded-2xl border px-3 py-3 text-left transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                'disabled:cursor-not-allowed disabled:opacity-45',
                isActive
                  ? 'border-accent-purple/50 bg-accent-purple/20 text-white shadow-purple-glow'
                  : 'border-white/10 bg-black/25 text-text-secondary hover:border-white/20 hover:bg-white/10 hover:text-white',
                optionClassName
              )}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                {option.icon}
                {option.label}
              </span>
              {option.description && (
                <span className="mt-1 block text-xs leading-snug text-text-tertiary">
                  {option.description}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

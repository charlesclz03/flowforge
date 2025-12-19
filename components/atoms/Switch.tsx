'use client'

import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  className?: string
  disabled?: boolean
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  className,
  disabled = false,
}: SwitchProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {label && (
        <span className={cn('text-sm font-medium text-text-secondary', disabled && 'opacity-50')}>
          {label}
        </span>
      )}
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75',
          checked ? 'bg-accent-purple' : 'bg-white/20',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span className="sr-only">{label || 'Toggle'}</span>
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}

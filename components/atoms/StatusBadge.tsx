import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StatusTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'premium'

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  tone?: StatusTone
}

const toneClasses: Record<StatusTone, string> = {
  neutral: 'border-white/10 bg-white/10 text-text-secondary',
  info: 'border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan',
  success: 'border-accent-green/25 bg-accent-green/10 text-accent-green',
  warning: 'border-accent-orange/25 bg-accent-orange/10 text-accent-orange',
  danger: 'border-accent-red/25 bg-accent-red/10 text-accent-red',
  premium: 'border-accent-gold/25 bg-accent-gold/10 text-accent-gold',
}

export function StatusBadge({
  children,
  tone = 'neutral',
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-semibold',
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

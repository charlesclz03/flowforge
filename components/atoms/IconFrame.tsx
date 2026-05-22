import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type IconFrameVariant = 'inline' | 'status' | 'action' | 'feature' | 'hero'
type IconFrameTone =
  | 'purple'
  | 'blue'
  | 'green'
  | 'gold'
  | 'orange'
  | 'red'
  | 'zinc'
  | 'white'

interface IconFrameProps {
  icon: LucideIcon
  variant?: IconFrameVariant
  tone?: IconFrameTone
  label?: string
  decorative?: boolean
  className?: string
  iconClassName?: string
  strokeWidth?: number
}

const frameClasses: Record<IconFrameVariant, string> = {
  inline: 'h-4 w-4',
  status: 'h-5 w-5 rounded-full bg-white/10',
  action: 'h-11 w-11 rounded-xl border',
  feature: 'h-14 w-14 rounded-2xl border',
  hero: 'h-20 w-20 rounded-full border',
}

const iconClasses: Record<IconFrameVariant, string> = {
  inline: 'h-4 w-4',
  status: 'h-3 w-3',
  action: 'h-5 w-5',
  feature: 'h-7 w-7',
  hero: 'h-10 w-10',
}

const toneClasses: Record<IconFrameTone, string> = {
  purple:
    'border-accent-purple/25 bg-accent-purple/10 text-accent-purple shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_0_16px_rgba(125,122,255,0.12)]',
  blue: 'border-accent-blue/25 bg-accent-blue/10 text-accent-blue shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_0_16px_rgba(10,132,255,0.12)]',
  green:
    'border-accent-green/25 bg-accent-green/10 text-accent-green shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_0_16px_rgba(48,209,88,0.12)]',
  gold: 'border-accent-gold/25 bg-accent-gold/10 text-accent-gold shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_0_16px_rgba(255,214,10,0.12)]',
  orange:
    'border-accent-orange/25 bg-accent-orange/10 text-accent-orange shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_0_16px_rgba(255,149,0,0.12)]',
  red: 'border-accent-red/25 bg-accent-red/10 text-accent-red shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_0_16px_rgba(255,59,48,0.12)]',
  zinc: 'border-white/10 bg-white/5 text-text-secondary shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]',
  white:
    'border-white/15 bg-white/10 text-white shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]',
}

const inlineToneClasses: Record<IconFrameTone, string> = {
  purple: 'text-accent-purple',
  blue: 'text-accent-blue',
  green: 'text-accent-green',
  gold: 'text-accent-gold',
  orange: 'text-accent-orange',
  red: 'text-accent-red',
  zinc: 'text-text-secondary',
  white: 'text-white',
}

/**
 * Shared Lucide treatment for audit-sensitive UI surfaces.
 * Media controls may still use filled icons; navigation/header active states may use stroke 2.5.
 */
export function IconFrame({
  icon: Icon,
  variant = 'inline',
  tone = 'zinc',
  label,
  decorative = false,
  className,
  iconClassName,
  strokeWidth = 2,
}: IconFrameProps) {
  return (
    <span
      aria-hidden={decorative || !label ? true : undefined}
      role={!decorative && label ? 'img' : undefined}
      aria-label={!decorative && label ? label : undefined}
      className={cn(
        'inline-flex flex-shrink-0 items-center justify-center',
        frameClasses[variant],
        variant !== 'inline' && toneClasses[tone],
        variant === 'inline' && inlineToneClasses[tone],
        className
      )}
    >
      <Icon
        className={cn(iconClasses[variant], iconClassName)}
        strokeWidth={strokeWidth}
      />
    </span>
  )
}

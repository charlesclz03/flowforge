import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SurfaceTone = 'base' | 'elevated' | 'highlight' | 'glass'
type SurfacePadding = 'none' | 'sm' | 'md' | 'lg'

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  tone?: SurfaceTone
  padding?: SurfacePadding
}

const toneClasses: Record<SurfaceTone, string> = {
  base: 'border-white/10 bg-surface-base/90 shadow-surface-1',
  elevated: 'border-white/10 bg-surface-elevation-1/80 shadow-surface-1',
  highlight:
    'border-accent-purple/20 bg-surface-highlight/70 shadow-purple-glow',
  glass:
    'border-white/10 bg-background-card/60 shadow-surface-1 backdrop-blur-xl',
}

const paddingClasses: Record<SurfacePadding, string> = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
}

export function Surface({
  children,
  tone = 'elevated',
  padding = 'md',
  className,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border backdrop-blur-light',
        toneClasses[tone],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

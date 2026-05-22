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
  base: 'border-white/10 bg-surface-base/90 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_18px_50px_rgba(0,0,0,0.28)]',
  elevated:
    'border-white/10 bg-surface-elevation-1/80 shadow-[0_1px_0_rgba(255,255,255,0.055)_inset,0_22px_58px_rgba(0,0,0,0.34)]',
  highlight:
    'border-accent-purple/20 bg-surface-highlight/70 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_20px_60px_rgba(125,122,255,0.16)]',
  glass:
    'border-white/10 bg-background-card/60 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_22px_64px_rgba(0,0,0,0.36)] backdrop-blur-xl',
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
        'rounded-2xl border backdrop-blur-light transition-colors',
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

'use client'

import { cn } from '@/lib/utils'

interface SirenOverlayProps {
  isActive: boolean
  className?: string
}

export function SirenOverlay({ isActive, className }: SirenOverlayProps) {
  if (!isActive) return null

  return (
    <div className={cn('fixed inset-0 pointer-events-none z-50 overflow-hidden', className)}>
      {/* Red flash background */}
      <div className="absolute inset-0 bg-accent-red/10 animate-pulse" />

      {/* Left-to-right scanning siren beam */}
      <div className="absolute inset-0 w-full h-full mix-blend-overlay">
        <div className="w-[50%] h-full bg-gradient-to-r from-transparent via-accent-red/50 to-transparent blur-3xl animate-siren-scan" />
      </div>

      {/* Vignette to focus attention */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60" />
    </div>
  )
}

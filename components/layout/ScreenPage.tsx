import React from 'react'
import { cn } from '@/lib/utils'

interface ScreenPageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  /**
   * If true, the footer will have extra padding for safe area (e.g. if it's the bottom nav)
   * Default: true
   */
  safeAreaBottom?: boolean
}

/**
 * A layout wrapper for single-screen "app-like" experiences.
 * This component takes up 100dvh and prevents the window from scrolling.
 * Content scrolls internally.
 */
export function ScreenPage({
  children,
  header,
  footer,
  className,
  ...props
}: ScreenPageProps) {
  return (
    <main
      className={cn(
        'relative flex flex-col w-full h-full min-h-full bg-background',
        className
      )}
      {...props}
    >
      {/* Header Area - Sticky if needed, or just normal flow */}
      {header && <div className="flex-none z-30 relative">{header}</div>}

      {/* Content Area - Internal Scrolling if needed, or just flow */}
      <div className="flex-1 min-h-0 w-full relative z-0">{children}</div>

      {/* Deprecated Footer Slot - Keeping for backward compat if passed explicitly, but global nav is outside */}
      {footer && (
        <div className="flex-none z-30 relative pb-safe">{footer}</div>
      )}
    </main>
  )
}

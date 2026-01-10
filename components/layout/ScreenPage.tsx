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
  safeAreaBottom = true,
  ...props
}: ScreenPageProps) {
  return (
    <main
      className={cn(
        'relative flex flex-col w-full h-[100dvh] overflow-hidden bg-background',
        className
      )}
      {...props}
    >
      {/* Fixed Header Area */}
      {header && <div className="flex-none z-30 relative">{header}</div>}

      {/* Scrollable Content Area */}
      <div className="flex-1 w-full relative overflow-y-auto overflow-x-hidden scrollbar-hide overscroll-y-contain">
        {children}
      </div>

      {/* Fixed Footer Area */}
      {footer && (
        <div
          className={cn('flex-none z-30 relative', {
            'pb-[env(safe-area-inset-bottom)]': safeAreaBottom,
          })}
        >
          {footer}
        </div>
      )}
    </main>
  )
}

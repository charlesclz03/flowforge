'use client'

import { cn } from '@/lib/utils'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveLayout({
  children,
  className,
}: ResponsiveLayoutProps) {
  // User Feedback: "I don't want the sidebar on the left, this is not needed as everything for naviguation is from the bottom bar"
  // Reverting to single-column layout for all screen sizes, while keeping the container styling.

  return (
    <div
      className={cn(
        'h-[100dvh] w-full overflow-hidden bg-background text-text-primary relative',
        className
      )}
    >
      {children}
    </div>
  )
}

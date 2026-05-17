'use client'

import type { ReactNode } from 'react'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { OnboardingProgress } from '@/components/organisms/layout/OnboardingProgress'
import { cn } from '@/lib/utils'

interface OnboardingLayoutProps {
  children: ReactNode
  className?: string
  showBackButton?: boolean
  showSettings?: boolean
  showHeader?: boolean
  showProgress?: boolean
  onBack?: () => void
  customTitle?: string
  customSubtitle?: string
  /** If true, prevents scroll and fits content to screen (for immersive pages like practice) */
  preventScroll?: boolean
}

export function OnboardingLayout({
  children,
  className,
  showBackButton = false,
  showSettings = true,
  showHeader = true,
  showProgress = true,
  onBack,
  customTitle,
  customSubtitle,
  preventScroll = false,
}: OnboardingLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-[100dvh] app-ambient text-white flex flex-col',
        preventScroll ? 'overflow-hidden h-[100dvh]' : '',
        className
      )}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(125,122,255,0.12),transparent_34rem)]" />

      {/* Page content */}
      <div className="relative z-10 flex flex-1 flex-col min-h-0">
        <AppHeader
          showBackButton={showBackButton}
          showSettings={showSettings}
          onBack={onBack}
          hide={!showHeader}
          customTitle={customTitle}
          customSubtitle={customSubtitle}
        />

        <main
          role="main"
          className={cn(
            'flex flex-1 flex-col px-6 pt-4 sm:pt-6',
            'pb-8 sm:pb-10'
          )}
        >
          <div
            className={cn(
              'w-full max-w-4xl mx-auto',
              preventScroll && 'h-full flex flex-col min-h-0'
            )}
          >
            {children}
            {!preventScroll && showProgress && <OnboardingProgress />}
          </div>
        </main>
      </div>
    </div>
  )
}

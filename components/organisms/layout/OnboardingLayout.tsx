'use client'

import type { ReactNode } from 'react'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { OnboardingProgress } from '@/components/organisms/layout/OnboardingProgress'
import { cn } from '@/lib/utils'

interface OnboardingLayoutProps {
  children: ReactNode
  className?: string
  showBackButton?: boolean
  onBack?: () => void
}

export function OnboardingLayout({
  children,
  className,
  showBackButton = false,
  onBack,
}: OnboardingLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-black text-white overflow-hidden', className)}>
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-950/20 to-black" />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed top-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none fixed bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl animate-pulse delay-1000" />

      {/* Page content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <AppHeader showBackButton={showBackButton} onBack={onBack} />

        <main
          id="main-content"
          role="main"
          className="flex flex-1 justify-center px-6 pb-8 pt-4 sm:pt-6"
        >
          <div className="w-full max-w-4xl">{children}</div>
        </main>
      </div>

      {/* Bottom page progress indicator */}
      <OnboardingProgress />
    </div>
  )
}



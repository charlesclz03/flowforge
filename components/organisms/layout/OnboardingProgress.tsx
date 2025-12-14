'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const STEP_PATHS: { path: string; index: number }[] = [
  { path: '/howitworks', index: 0 },
  { path: '/difficultyselection', index: 1 },
  { path: '/selectdifficulty', index: 1 },
  { path: '/practice', index: 2 },
]

export function OnboardingProgress({ className }: { className?: string }) {
  const pathname = usePathname()

  const activeStep = STEP_PATHS.find((step) => step.path === pathname)?.index

  // Only render on onboarding-related pages
  if (activeStep === undefined) return null

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center space-x-2',
        className
      )}
    >
      {[0, 1, 2].map((index) => {
        const isActive = index === activeStep
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: progress indicator is static
            key={index}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              isActive ? 'w-8 bg-accent-purple' : 'w-2 bg-white/20'
            )}
          />
        )
      })}
    </div>
  )
}



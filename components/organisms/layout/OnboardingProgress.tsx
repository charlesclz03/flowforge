'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const STEP_PATHS: { path: string; index: number }[] = [
  { path: '/howitworks', index: 0 },
  { path: '/difficultyselection', index: 1 },
  { path: '/selectdifficulty', index: 1 },
]

export function OnboardingProgress({ className }: { className?: string }) {
  const pathname = usePathname()

  const activeStep = STEP_PATHS.find((step) => step.path === pathname)?.index

  // Only render on onboarding-related pages
  if (activeStep === undefined) return null

  const steps = Array.from(new Set(STEP_PATHS.map((s) => s.index))).sort(
    (a, b) => a - b
  )

  return (
    <nav
      aria-label="Onboarding progress"
      className={cn(
        'flex items-center justify-center space-x-2 py-6',
        className
      )}
    >
      {steps.map((index) => {
        const isActive = index === activeStep
        return (
          <span
            key={index}
            aria-label={`Step ${index + 1}${isActive ? ', current step' : ''}`}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              isActive ? 'w-8 bg-accent-purple' : 'w-2 bg-white/20'
            )}
          />
        )
      })}
    </nav>
  )
}

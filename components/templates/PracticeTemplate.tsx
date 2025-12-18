'use client'

import { ReactNode } from 'react'

interface PracticeTemplateProps {
  pageHeader: ReactNode
  alerts?: ReactNode
  beatSelector: ReactNode
  sessionConfig?: ReactNode
  practiceControls?: ReactNode
  helpSection: ReactNode
}

export function PracticeTemplate({
  pageHeader,
  alerts,
  beatSelector,
  sessionConfig,
  practiceControls,
  helpSection,
}: PracticeTemplateProps) {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-64px-100px)] pb-4">
      {/* Page Header */}
      <div className="flex-shrink-0">{pageHeader}</div>

      {/* Success/Error Alerts */}
      {alerts && <div className="flex-shrink-0 mt-4">{alerts}</div>}

      {/* Beat Selector - Desktop only, mobile uses the player info bar */}
      <div className="flex-shrink-0 hidden md:block mt-4">{beatSelector}</div>

      {/* Session Configuration - Desktop only */}
      {sessionConfig && <div className="flex-shrink-0 hidden lg:block mt-4">{sessionConfig}</div>}

      {/* Practice Controls - Takes remaining space, centered */}
      <div className="flex-1 flex items-center justify-center py-4">{practiceControls}</div>

      {/* Help Section - Hidden on mobile */}
      {helpSection && <div className="flex-shrink-0 hidden lg:block">{helpSection}</div>}
    </div>
  )
}

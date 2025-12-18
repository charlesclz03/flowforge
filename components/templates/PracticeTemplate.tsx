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
    <div className="flex flex-col h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-120px)] min-h-0">
      {/* Page Header - Compact on mobile */}
      <div className="flex-shrink-0">{pageHeader}</div>

      {/* Success/Error Alerts */}
      {alerts && <div className="flex-shrink-0">{alerts}</div>}

      {/* Beat Selector - Hidden on mobile during session, compact otherwise */}
      <div className="flex-shrink-0 hidden md:block">{beatSelector}</div>

      {/* Session Configuration - Desktop only */}
      {sessionConfig && <div className="flex-shrink-0 hidden lg:block">{sessionConfig}</div>}

      {/* Practice Controls - Takes remaining space, centered */}
      <div className="flex-1 flex items-center justify-center min-h-0 py-2">{practiceControls}</div>

      {/* Help Section - Hidden on mobile */}
      {helpSection && <div className="flex-shrink-0 hidden lg:block">{helpSection}</div>}
    </div>
  )
}

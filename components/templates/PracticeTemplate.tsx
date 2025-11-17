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
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      {pageHeader}

      {/* Success/Error Alerts */}
      {alerts}

      {/* Beat Selector */}
      {beatSelector}

      {/* Session Configuration */}
      {sessionConfig}

      {/* Practice Controls */}
      {practiceControls}

      {/* Help Section */}
      {helpSection}
    </div>
  )
}

'use client'

import { ReactNode } from 'react'

interface ProfileTemplateProps {
  pageHeader: ReactNode
  accountInfo: ReactNode
  subscription: ReactNode
  security: ReactNode
  stats: ReactNode
  quickActions?: ReactNode
  adminSection?: ReactNode
}

export function ProfileTemplate({
  pageHeader,
  accountInfo,
  subscription,
  security,
  stats,
  quickActions,
  adminSection,
}: ProfileTemplateProps) {
  return (
    <div className="space-y-8 pb-32">
      {/* Page Header */}
      {pageHeader}

      {/* Account Information */}
      {accountInfo}

      {/* Subscription Management */}
      {subscription}

      {/* Security Settings */}
      {security}

      {/* Stats */}
      {stats}

      {/* Quick Actions */}
      {quickActions}

      {/* Admin Section */}
      {adminSection}
    </div>
  )
}

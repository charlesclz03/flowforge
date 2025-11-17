'use client'

import { ReactNode } from 'react'
import { Container } from '@/components/atoms/Container'

interface ProfileTemplateProps {
  header: ReactNode
  pageHeader: ReactNode
  accountInfo: ReactNode
  subscription: ReactNode
  security: ReactNode
  stats: ReactNode
  quickActions: ReactNode
}

export function ProfileTemplate({
  header,
  pageHeader,
  accountInfo,
  subscription,
  security,
  stats,
  quickActions,
}: ProfileTemplateProps) {
  return (
    <div className="min-h-screen bg-background">
      {header}

      <main className="py-8">
        <Container>
          <div className="space-y-8">
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
          </div>
        </Container>
      </main>
    </div>
  )
}

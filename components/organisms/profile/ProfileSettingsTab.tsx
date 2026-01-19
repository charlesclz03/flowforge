'use client'

import { SubscriptionSection } from '@/components/organisms/profile/SubscriptionSection'
import { SecuritySection } from '@/components/organisms/profile/SecuritySection'

export function ProfileSettingsTab() {
  return (
    <div className="space-y-6">
      <SubscriptionSection />
      <SecuritySection />
    </div>
  )
}

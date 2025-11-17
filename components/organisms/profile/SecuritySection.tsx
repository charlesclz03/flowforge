'use client'

import { Card } from '@/components/atoms/Card'
import { SignOutButton } from '@/components/molecules/auth/SignOutButton'

export function SecuritySection() {
  return (
    <Card title="Security">
      <div className="space-y-4">
        {/* Password Reset */}
        <div className="flex items-center justify-between rounded-xl border border-stroke-subtle/20 bg-background-elevated/50 p-4">
          <div>
            <h3 className="font-medium text-white">Password</h3>
            <p className="mt-1 text-sm text-text-secondary">You're signed in with Google OAuth</p>
          </div>
          <a
            href="https://myaccount.google.com/security"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-stroke-subtle/40 bg-background-card px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-accent-blue/40 hover:text-white"
          >
            Manage on Google
          </a>
        </div>

        {/* Sign Out */}
        <div className="flex items-center justify-between rounded-xl border border-stroke-subtle/20 bg-background-elevated/50 p-4">
          <div>
            <h3 className="font-medium text-white">Sign Out</h3>
            <p className="mt-1 text-sm text-text-secondary">Sign out of your FlowForge account</p>
          </div>
          <SignOutButton className="rounded-lg border border-stroke-subtle/40 bg-background-card px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-accent-red/40 hover:text-accent-red" />
        </div>
      </div>
    </Card>
  )
}

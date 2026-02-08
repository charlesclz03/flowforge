'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/atoms/Card'
import { UpgradeButton } from '@/components/molecules/subscription/UpgradeButton'
import { ManageSubscriptionButton } from '@/components/molecules/subscription/ManageSubscriptionButton'
import { isProUser } from '@/lib/subscription/isPro'

export function SubscriptionSection() {
  const { data: session } = useSession()
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>(
    'monthly'
  )

  const isPro = isProUser(session?.user)

  return (
    <Card title="Manage Subscription">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            {isPro
              ? 'You are currently on the FreeStyla Pro plan.'
              : 'Upgrade to unlock unlimited usage and professional features.'}
          </p>

          {isPro && <ManageSubscriptionButton />}
        </div>

        {!isPro && (
          <>
            {/* Billing Toggle */}
            <div className="flex justify-center">
              <div className="flex items-center p-1 bg-background-card/50 rounded-lg border border-white/5">
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    billingInterval === 'monthly'
                      ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/20'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('yearly')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    billingInterval === 'yearly'
                      ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/20'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  Yearly{' '}
                  <span className="text-xs text-accent-green ml-1">-17%</span>
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Free Plan */}
              <div className="rounded-2xl border border-stroke-subtle/40 bg-background-card/40 p-6 backdrop-blur-light">
                <h3 className="text-lg font-medium text-white">Free</h3>
                <p className="mt-1 text-3xl font-light text-white">
                  €0
                  <span className="text-base text-text-secondary">
                    /forever
                  </span>
                </p>

                <ul className="mt-5 space-y-3">
                  {[
                    'Practice mode (10 min sessions)',
                    'Access to free beats',
                    'Word prompts (all difficulties)',
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-text-secondary"
                    >
                      <svg
                        className="h-5 w-5 text-accent-green"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled
                  className="mt-6 w-full rounded-lg border border-stroke-subtle/40 bg-background-card py-2.5 text-sm font-medium text-text-primary opacity-50 cursor-default"
                >
                  Current Plan
                </button>
              </div>

              {/* Pro Plan */}
              <div className="relative rounded-2xl border border-accent-purple/30 bg-gradient-to-br from-accent-purple/10 via-accent-purple/5 to-accent-violet/10 p-6 backdrop-blur-light shadow-glow">
                <div className="absolute -top-3 right-4 rounded-full bg-accent-purple px-3 py-1 text-xs font-semibold text-black">
                  Recommended
                </div>
                <h3 className="text-lg font-medium text-white">Pro</h3>
                <p className="mt-1 text-3xl font-light text-white">
                  {billingInterval === 'monthly' ? '€4.99' : '€49.00'}
                  <span className="text-base text-text-secondary">
                    /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </p>

                <ul className="mt-5 space-y-3">
                  {[
                    'Unlimited practice sessions',
                    'Access to all premium beats',
                    'Save & download recordings',
                    'Upload your own beats',
                    'Stats & history visualization',
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-text-secondary"
                    >
                      <svg
                        className="h-5 w-5 text-accent-purple"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <UpgradeButton
                  plan={billingInterval}
                  className="mt-6 w-full rounded-full bg-gradient-pulse shadow-neon transition hover:shadow-glow"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}

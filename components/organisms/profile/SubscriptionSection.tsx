'use client'

import { Card } from '@/components/atoms/Card'

export function SubscriptionSection() {
  return (
    <Card title="Manage Subscription">
      <div className="space-y-6">
        <p className="text-sm text-text-secondary">
          Review your current plan and see what&apos;s coming next for FlowForge Premium.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Free plan (current) */}
          <div className="rounded-2xl border border-stroke-subtle/40 bg-background-card/40 p-6 backdrop-blur-light">
            <h3 className="text-lg font-medium text-white">Free</h3>
            <p className="mt-1 text-3xl font-light text-white">
              $0<span className="text-base text-text-secondary">/month</span>
            </p>

            <ul className="mt-5 space-y-3">
              {['2-minute practice sessions', 'Access to free beats', 'Session history'].map(
                (feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
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
                )
              )}
            </ul>

            <button className="mt-6 w-full rounded-lg border border-stroke-subtle/40 bg-background-card py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-accent-blue/40">
              Current Plan
            </button>
          </div>

          {/* Premium plan (coming soon) */}
          <div className="relative rounded-2xl border border-stroke-glow/60 bg-gradient-to-br from-accent-purple/10 via-accent-purple/5 to-accent-violet/10 p-6 backdrop-blur-light shadow-glow">
            <div className="absolute -top-3 right-4 rounded-full bg-accent-purple px-3 py-1 text-xs font-semibold text-black">
              Coming Soon
            </div>
            <h3 className="text-lg font-medium text-white">Premium</h3>
            <p className="mt-1 text-3xl font-light text-white">
              $4.99<span className="text-base text-text-secondary">/month</span>
            </p>

            <ul className="mt-5 space-y-3">
              {[
                'Unlimited practice sessions',
                'Access to all premium beats',
                'Download recordings',
                'Advanced analytics',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
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

            <button
              disabled
              className="mt-6 w-full rounded-full bg-gradient-pulse px-6 py-2.5 text-center text-sm font-semibold text-black shadow-neon transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}

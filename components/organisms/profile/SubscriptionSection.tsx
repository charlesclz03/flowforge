'use client'

import { Card } from '@/components/atoms/Card'

export function SubscriptionSection() {
  return (
    <Card title="Subscription">
      <div className="space-y-4">
        {/* Current Plan */}
        <div className="rounded-xl border border-stroke-subtle/20 bg-background-elevated/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Free Plan</h3>
              <p className="mt-1 text-sm text-text-secondary">
                2-minute sessions • Free beats only
              </p>
            </div>
            <span className="rounded-full bg-accent-blue/10 px-3 py-1 text-sm font-medium text-accent-blue">
              Active
            </span>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
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
              <span>Access to free beats</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
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
              <span>2-minute practice sessions</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
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
              <span>Session history</span>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="rounded-xl border border-accent-orange/20 bg-gradient-to-br from-accent-orange/5 to-accent-violet/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-white">Upgrade to Premium</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Unlock unlimited sessions, premium beats, and advanced features
              </p>
            </div>
            <button
              disabled
              className="whitespace-nowrap rounded-lg bg-accent-orange px-6 py-2 text-sm font-semibold text-black transition-all hover:bg-accent-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}

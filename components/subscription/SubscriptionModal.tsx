'use client'

import { X, Check } from 'lucide-react'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubscribe?: (plan: 'monthly' | 'annual') => void
}

/**
 * Subscription modal placeholder component
 * TODO: Implement real Stripe checkout in production
 */
export function SubscriptionModal({ isOpen, onClose, onSubscribe }: SubscriptionModalProps) {
  if (!isOpen) return null

  const handleSubscribe = (plan: 'monthly' | 'annual') => {
    // Placeholder - will integrate Stripe in V2
    alert(`${plan} subscription checkout will be implemented in V2`)
    if (onSubscribe) onSubscribe(plan)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg card p-6 space-y-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg text-text-secondary hover:bg-background-elevated transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="space-y-2">
          <h2 className="text-2xl font-light">Upgrade to Pro</h2>
          <p className="text-text-secondary">Choose the plan that works for you</p>
        </div>

        {/* Monthly Plan */}
        <div className="border-2 border-text-tertiary/20 rounded-xl p-4 hover:border-accent-orange/40 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-text-primary">Monthly</h3>
              <p className="text-text-secondary text-sm">Pay month-to-month</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-text-primary">$4.99</div>
              <div className="text-text-tertiary text-xs">/month</div>
            </div>
          </div>
          <button
            onClick={() => handleSubscribe('monthly')}
            className="w-full py-2 rounded-lg bg-accent-orange text-black font-medium transition-all hover:bg-opacity-90"
          >
            Subscribe Monthly
          </button>
        </div>

        {/* Annual Plan */}
        <div className="border-2 border-accent-orange rounded-xl p-4 bg-accent-orange/5 relative">
          <div className="absolute -top-3 left-4 px-2 py-1 bg-accent-orange text-black text-xs font-medium rounded-full">
            Save 17%
          </div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-text-primary">Annual</h3>
              <p className="text-text-secondary text-sm">Best value</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-text-primary">$49.99</div>
              <div className="text-text-tertiary text-xs">/year</div>
            </div>
          </div>
          <button
            onClick={() => handleSubscribe('annual')}
            className="w-full py-2 rounded-lg bg-accent-orange text-black font-medium transition-all hover:bg-opacity-90"
          >
            Subscribe Annually
          </button>
        </div>

        {/* Features */}
        <div className="space-y-2 pt-4 border-t border-text-tertiary/10">
          <p className="text-text-secondary text-sm font-medium">What's included:</p>
          {[
            'Unlimited recording time',
            'Access to 100+ premium beats',
            'Ad-free experience',
            'Upload your own beats',
            'AI-powered features (V2)',
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-text-secondary text-sm">
              <Check size={16} className="text-accent-green" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <p className="text-text-tertiary text-xs text-center pt-2">
          Stripe integration coming in V2
        </p>
      </div>
    </div>
  )
}

/**
 * Comment for future implementation:
 * 
 * To implement Stripe subscriptions:
 * 1. Create products and prices in Stripe Dashboard
 * 2. Install @stripe/stripe-js
 * 3. Create checkout session API route
 * 4. Redirect to Stripe Checkout
 * 5. Handle webhook for subscription events
 * 6. Store subscription status in database
 * 7. Implement subscription management portal
 * 
 * API Route: /api/stripe/checkout
 * Webhook Route: /api/stripe/webhook
 */


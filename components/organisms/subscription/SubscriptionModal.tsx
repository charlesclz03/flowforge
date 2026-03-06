'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { X, Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubscribe?: (plan: 'monthly' | 'yearly') => void
  beatCount?: number
}

/**
 * Subscription modal for upgrading to Pro (redirects to Stripe Checkout).
 */
export function SubscriptionModal({
  isOpen,
  onClose,
  onSubscribe: _onSubscribe,
  beatCount = 100,
}: SubscriptionModalProps) {
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan)
    trackEvent('checkout_cta_click', {
      source: 'subscription_modal',
      plan,
    })
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to start checkout')
      }

      const { url } = await response.json()
      if (url) {
        trackEvent('checkout_redirect_ready', {
          source: 'subscription_modal',
          plan,
        })
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      trackEvent('checkout_error', {
        source: 'subscription_modal',
        plan,
      })
      toast.error(
        error instanceof Error ? error.message : 'Failed to start checkout'
      )
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="card relative w-full max-w-lg space-y-6 p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-text-secondary transition-colors hover:bg-background-elevated"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="space-y-2">
          <h2 className="text-2xl font-light">Upgrade to Pro</h2>
          <p className="text-text-secondary">
            Choose the plan that works for you
          </p>
        </div>

        <div
          className={`rounded-xl border-2 border-text-tertiary/20 p-4 transition-colors hover:border-accent-orange/40 ${loading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="font-medium text-text-primary">Monthly</h3>
              <p className="text-sm text-text-secondary">Pay month-to-month</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-text-primary">
                EUR 4.99
              </div>
              <div className="text-xs text-text-tertiary">/month</div>
            </div>
          </div>
          <button
            onClick={() => handleSubscribe('monthly')}
            disabled={!!loading}
            className="w-full rounded-lg bg-accent-orange py-2 font-medium text-black transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading === 'monthly' ? 'Processing...' : 'Subscribe Monthly'}
          </button>
        </div>

        <div
          className={`relative rounded-xl border-2 border-accent-orange bg-accent-orange/5 p-4 ${loading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <div className="absolute -top-3 left-4 rounded-full bg-accent-orange px-2 py-1 text-xs font-medium text-black">
            Save 17%
          </div>
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="font-medium text-text-primary">Yearly</h3>
              <p className="text-sm text-text-secondary">Best value</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-text-primary">
                EUR 49.00
              </div>
              <div className="text-xs text-text-tertiary">/year</div>
            </div>
          </div>
          <button
            onClick={() => handleSubscribe('yearly')}
            disabled={!!loading}
            className="w-full rounded-lg bg-accent-orange py-2 font-medium text-black transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading === 'yearly' ? 'Processing...' : 'Subscribe Yearly'}
          </button>
        </div>

        <div className="space-y-2 border-t border-text-tertiary/10 pt-4">
          <p className="text-sm font-medium text-text-secondary">
            What's included:
          </p>
          {[
            'Unlimited recording time',
            `Access to ${beatCount}+ premium beats`,
            'Ad-free experience',
            'Upload your own beats',
            'New features as they ship',
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-sm text-text-secondary"
            >
              <Check size={16} className="text-accent-green" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <p className="pt-2 text-center text-xs text-text-tertiary">
          Secure checkout powered by Stripe.
        </p>
      </div>
    </div>
  )
}

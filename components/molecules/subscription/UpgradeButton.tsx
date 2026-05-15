'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { trackEvent } from '@/lib/analytics/track'
import { cn } from '@/lib/utils'

interface UpgradeButtonProps {
  plan?: 'monthly' | 'yearly'
  className?: string
  source?: string
  children?: React.ReactNode
}

export function UpgradeButton({
  plan = 'monthly',
  className,
  source = 'upgrade_button',
  children,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    trackEvent('checkout_cta_click', {
      source,
      plan,
    })
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start checkout')
      }

      if (data.url) {
        trackEvent('checkout_redirect_ready', {
          source,
          plan,
        })
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      trackEvent('checkout_error', {
        source,
        plan,
      })
      toast.error(
        error instanceof Error ? error.message : 'Failed to start checkout'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleUpgrade}
      disabled={loading}
      aria-label={`Upgrade to Pro ${plan}`}
      className={cn(
        'btn-primary px-8 py-3 w-full sm:w-auto',
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading
        ? 'Processing...'
        : children ||
          (plan === 'yearly' ? 'Upgrade Yearly' : 'Upgrade Monthly')}
    </button>
  )
}

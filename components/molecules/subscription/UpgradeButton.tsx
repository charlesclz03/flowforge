'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { trackEvent } from '@/lib/analytics/track'
import { cn } from '@/lib/utils'

interface UpgradeButtonProps {
  plan?: 'monthly' | 'yearly'
  className?: string
}

export function UpgradeButton({
  plan = 'monthly',
  className,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    trackEvent('checkout_cta_click', {
      source: 'upgrade_button',
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
          source: 'upgrade_button',
          plan,
        })
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      trackEvent('checkout_error', {
        source: 'upgrade_button',
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
      onClick={handleUpgrade}
      disabled={loading}
      className={cn(
        'btn-primary px-8 py-3 w-full sm:w-auto',
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading
        ? 'Processing...'
        : plan === 'yearly'
          ? 'Upgrade Yearly'
          : 'Upgrade Monthly'}
    </button>
  )
}

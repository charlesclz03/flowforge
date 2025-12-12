'use client'

import { useState } from 'react'

export function UpgradeButton({ plan = 'monthly' }: { plan?: 'monthly' | 'yearly' }) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL received')
        // Ideally show a toast here
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`btn-primary px-8 py-3 w-full sm:w-auto ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Processing...' : plan === 'yearly' ? 'Upgrade Yearly' : 'Upgrade Monthly'}
    </button>
  )
}

'use client'

import { useState } from 'react'

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  const handleManage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className={`px-6 py-2 rounded-full border border-stroke-subtle hover:bg-white/5 transition-colors ${loading ? 'opacity-50' : ''}`}
    >
      {loading ? 'Loading...' : 'Manage Subscription'}
    </button>
  )
}

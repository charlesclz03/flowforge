'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-4xl font-light">Something went wrong</h2>
          <p className="text-text-secondary">{error.message || 'An unexpected error occurred'}</p>
        </div>

        <button onClick={reset} className="btn-primary px-8 py-3">
          Try again
        </button>
      </div>
    </div>
  )
}

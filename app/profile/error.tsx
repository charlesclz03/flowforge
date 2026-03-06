'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the actual error to an error reporting service in production
    console.error('Profile route error:', error)
  }, [error])

  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center p-6 text-center text-red-500">
      <div className="mb-6 rounded-full bg-red-500/10 p-4">
        <AlertCircle size={48} className="text-red-500" />
      </div>
      <h2 className="mb-4 text-2xl font-black uppercase text-white">
        Profile Unavailable
      </h2>
      <p className="mb-8 max-w-sm text-sm text-gray-400">
        We couldn't load this profile data. The user might not exist, or there
        could be a temporary connection issue.
      </p>
      <button
        onClick={() => reset()}
        className="group flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 font-bold text-red-500 transition-all hover:bg-red-500/20 active:scale-95"
      >
        <RefreshCcw
          size={20}
          className="transition-transform group-hover:rotate-180"
        />
        RETRY LOADING
      </button>
    </div>
  )
}

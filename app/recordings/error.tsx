'use client'

import { useEffect } from 'react'
import { DatabaseZap, RefreshCcw } from 'lucide-react'

export default function RecordingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the actual error to an error reporting service in production
    console.error('Recordings route error:', error)
  }, [error])

  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center p-6 text-center text-primary-500">
      <div className="mb-6 rounded-full bg-primary-500/10 p-4">
        <DatabaseZap
          size={48}
          className="text-primary-500 shadow-[0_0_20px_rgba(var(--primary-glow),0.5)]"
        />
      </div>
      <h2 className="mb-4 text-2xl font-black uppercase text-white">
        Data Retrieval Failed
      </h2>
      <p className="mb-8 max-w-sm text-sm text-gray-400">
        We encountered an error while fetching your recordings. This is usually
        a temporary issue with our database or audio storage.
      </p>
      <button
        onClick={() => reset()}
        className="group flex items-center justify-center gap-2 rounded-xl border border-primary-500/30 bg-primary-500/10 px-6 py-4 font-bold text-primary-500 transition-all hover:bg-primary-500/20 active:scale-95"
      >
        <RefreshCcw
          size={20}
          className="transition-transform group-hover:rotate-180"
        />
        RETRY CONNECTION
      </button>
    </div>
  )
}

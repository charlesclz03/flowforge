'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function PracticeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the actual error to an error reporting service in production
    console.error('Practice route error:', error)
  }, [error])

  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center text-red-500">
      <div className="mb-6 rounded-full bg-red-500/10 p-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <AlertCircle size={48} className="text-red-500" />
      </div>
      <h2 className="mb-4 text-2xl font-black uppercase italic tracking-wider text-white">
        Engine Fault
      </h2>
      <p className="mb-8 max-w-sm text-sm text-gray-400">
        The practice engine encountered an unexpected error. This might be a
        temporary glitch with the beat engine or speech synthesis.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-4">
        <button
          onClick={() => reset()}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 font-bold text-white transition-all active:scale-95"
        >
          <RefreshCcw
            size={20}
            className="transition-transform group-hover:rotate-180"
          />
          REBOOT ENGINE
        </button>
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white transition-all hover:bg-white/10 active:scale-95"
        >
          <Home size={20} />
          BACK TO HUB
        </Link>
      </div>
    </div>
  )
}

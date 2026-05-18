'use client'

import { Button } from '@/components/atoms/Button'
import { RefreshCcw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
      <h1 className="text-3xl font-bold text-white tracking-widest uppercase">
        Offline
      </h1>
      <p className="text-text-secondary max-w-xs">
        FreeStyla needs a connection to sync this view. Check your network and
        try again.
      </p>

      <Button
        onClick={() => window.location.reload()}
        leftIcon={<RefreshCcw size={18} />}
        className="font-bold uppercase tracking-wider"
      >
        Retry connection
      </Button>

      <div className="text-xs text-text-tertiary">
        Check your internet connection
      </div>
    </div>
  )
}

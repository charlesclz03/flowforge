'use client'

import { memo } from 'react'
import { X } from 'lucide-react'
import { AppError } from '@/lib/errors'
import { cn } from '@/lib/utils'

interface ErrorAlertProps {
  error: AppError
  onDismiss: () => void
  className?: string
}

export const ErrorAlert = memo(function ErrorAlert({
  error,
  onDismiss,
  className,
}: ErrorAlertProps) {
  return (
    <div className={cn('rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-red-400">{error.message}</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-red-400/70 mt-1">Code: {error.code}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
          aria-label="Dismiss error"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
})

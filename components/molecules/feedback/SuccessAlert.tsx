'use client'

import { memo } from 'react'
import { CheckCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuccessAlertProps {
  message: string
  onDismiss: () => void
  className?: string
}

export const SuccessAlert = memo(function SuccessAlert({
  message,
  onDismiss,
  className,
}: SuccessAlertProps) {
  return (
    <div
      className={cn('rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3', className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-400">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-green-400 hover:text-green-300 transition-colors"
          aria-label="Dismiss success message"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
})

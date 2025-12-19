'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  description?: string
  showBackButton?: boolean
  onBack?: () => void
  rightAction?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  showBackButton = false,
  onBack,
  rightAction,
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <div className="mb-10 space-y-4">
      {showBackButton && (
        <div className="flex justify-start">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>
        </div>
      )}

      <div className="flex flex-col items-center justify-center text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl mx-auto text-base text-text-secondary sm:text-lg">
            {description}
          </p>
        )}
      </div>

      {rightAction && <div className="flex justify-center mt-4">{rightAction}</div>}
    </div>
  )
}

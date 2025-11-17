'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  description?: string
  showBackButton?: boolean
  onBack?: () => void
}

export function PageHeader({
  title,
  description,
  showBackButton = false,
  onBack,
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
    <div className="mb-6">
      {showBackButton && (
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      )}

      <h1 className="text-3xl sm:text-4xl font-light text-white text-center">{title}</h1>
      {description && <p className="mt-2 text-text-secondary text-center">{description}</p>}
    </div>
  )
}

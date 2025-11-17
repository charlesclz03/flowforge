import { memo } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/atoms/Spinner'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  isLoading?: boolean
  className?: string
}

export const EmptyState = memo(function EmptyState({
  title,
  description,
  icon,
  action,
  isLoading,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('py-12 text-center', className)}>
      {isLoading ? (
        <>
          <Spinner size="lg" className="mx-auto" />
          {title && <p className="mt-4 text-text-secondary">{title}</p>}
        </>
      ) : (
        <>
          {icon && <div className="mb-4 flex justify-center">{icon}</div>}
          {title && <p className="text-lg text-white">{title}</p>}
          {description && <p className="mt-2 text-text-secondary">{description}</p>}
          {action && <div className="mt-6">{action}</div>}
        </>
      )}
    </div>
  )
})

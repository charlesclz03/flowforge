import type { ReactNode } from 'react'
import { Surface } from '@/components/atoms/Surface'
import { cn } from '@/lib/utils'

interface FeatureTileProps {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  action?: ReactNode
  className?: string
}

export function FeatureTile({
  icon,
  title,
  description,
  meta,
  action,
  className,
}: FeatureTileProps) {
  return (
    <Surface
      tone="elevated"
      padding="md"
      className={cn(
        'flex min-h-[104px] items-start gap-4 rounded-2xl',
        className
      )}
    >
      {icon && <div className="shrink-0">{icon}</div>}
      <div className="min-w-0 flex-1">
        {meta && <div className="mb-2">{meta}</div>}
        <h3 className="text-sm font-semibold text-white sm:text-base">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Surface>
  )
}

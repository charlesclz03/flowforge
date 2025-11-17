import { memo } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  caption?: string
  icon?: React.ReactNode
  variant?: 'default' | 'compact'
  className?: string
}

export const StatCard = memo(function StatCard({
  label,
  value,
  caption,
  icon,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-stroke-subtle/20 bg-background-elevated/50 p-4',
        variant === 'compact' && 'text-center',
        className
      )}
    >
      {icon && <div className="mb-2">{icon}</div>}
      <dt className="text-xs uppercase tracking-[0.3em] text-text-tertiary">{label}</dt>
      <dd className="mt-2 text-3xl font-light text-white">{value}</dd>
      {caption && <p className="mt-1 text-xs text-text-secondary">{caption}</p>}
    </div>
  )
})

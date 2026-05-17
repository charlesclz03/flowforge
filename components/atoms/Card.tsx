import { cn } from '@/lib/utils'

interface CardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'glass'
  padding?: 'sm' | 'md' | 'lg'
  action?: React.ReactNode
  style?: React.CSSProperties
}

export function Card({
  title,
  subtitle,
  children,
  className,
  variant = 'default',
  padding = 'md',
  action,
}: CardProps) {
  const variants = {
    default: 'bg-surface-elevation-1/70 shadow-surface-1 backdrop-blur-light',
    elevated: 'bg-surface-elevation-2/75 shadow-surface-2 backdrop-blur-medium',
    glass: 'bg-background-card/60 shadow-surface-1 backdrop-blur-xl',
  }

  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-stroke-subtle/50 transition-colors',
        variants[variant],
        paddings[padding],
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-xl font-medium text-white">{title}</h2>
            )}
            {subtitle && <p className="mt-2 text-text-secondary">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

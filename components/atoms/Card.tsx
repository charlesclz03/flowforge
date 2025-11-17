import { cn } from '@/lib/utils'

interface CardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'glass'
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({
  title,
  subtitle,
  children,
  className,
  variant = 'default',
  padding = 'md',
}: CardProps) {
  const variants = {
    default: 'bg-background-card/40 backdrop-blur-light',
    elevated: 'bg-background-elevated/50',
    glass: 'bg-background-card/60 backdrop-blur-medium',
  }

  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-stroke-subtle/40',
        variants[variant],
        paddings[padding],
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h2 className="text-xl font-medium text-white">{title}</h2>}
          {subtitle && <p className="mt-2 text-text-secondary">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

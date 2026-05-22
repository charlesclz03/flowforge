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
  style,
}: CardProps) {
  const variants = {
    default:
      'bg-surface-elevation-1/75 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_20px_56px_rgba(0,0,0,0.3)] backdrop-blur-light',
    elevated:
      'bg-surface-elevation-2/80 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_26px_70px_rgba(0,0,0,0.36)] backdrop-blur-medium',
    glass:
      'bg-background-card/60 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_22px_64px_rgba(0,0,0,0.34)] backdrop-blur-xl',
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
      style={style}
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

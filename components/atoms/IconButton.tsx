import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from '@/components/atoms/Spinner'
import { cn } from '@/lib/utils'

type IconButtonVariant = 'ghost' | 'surface' | 'primary' | 'danger'
type IconButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  label: string
  variant?: IconButtonVariant
  size?: IconButtonSize
  isLoading?: boolean
}

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: 'text-text-secondary hover:bg-white/10 hover:text-white',
  surface:
    'border border-white/10 bg-surface-elevation-1/75 text-text-secondary shadow-surface-1 hover:border-white/20 hover:bg-surface-highlight/60 hover:text-white',
  primary:
    'border border-accent-purple/35 bg-primary text-primary-foreground shadow-purple-glow hover:bg-primary/90',
  danger:
    'border border-accent-red/35 bg-accent-red/10 text-accent-red shadow-red-glow hover:bg-accent-red/20',
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'h-10 w-10',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      label,
      variant = 'surface',
      size = 'md',
      isLoading = false,
      className,
      disabled,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full transition-all motion-safe:duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-45',
          !disabled && !isLoading && 'active:scale-95',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? <Spinner size="sm" /> : icon}
      </button>
    )
  }
)

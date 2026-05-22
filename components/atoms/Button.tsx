import { memo, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'
import { useHaptics } from '@/hooks/useHaptics'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  disableHaptics?: boolean
}

export const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      disableHaptics = false,
      onClick,
      ...props
    },
    ref
  ) {
    const { bump } = useHaptics()

    const variants = {
      primary:
        'border border-accent-purple/35 bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_14px_42px_rgba(125,122,255,0.28)] hover:bg-primary/90 hover:shadow-glow',
      secondary:
        'border border-white/10 bg-surface-elevation-1/80 text-text-primary shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_18px_44px_rgba(0,0,0,0.32)] hover:border-white/20 hover:bg-surface-highlight/75',
      ghost: 'text-text-primary hover:bg-white/10 hover:text-white',
      danger:
        'bg-danger text-danger-foreground shadow-red-glow hover:bg-danger/90',
      outline:
        'border border-stroke-subtle/70 bg-background-card/70 text-text-primary shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] hover:border-accent-blue/40 hover:bg-surface-highlight/60',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      xl: 'px-10 py-5 text-xl',
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableHaptics && !disabled && !isLoading) {
        bump()
      }
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full font-semibold transition-all motion-safe:duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          !disabled && !isLoading && 'active:scale-95',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span className="min-w-0 text-center">{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  })
)

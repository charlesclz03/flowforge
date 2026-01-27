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
      primary: 'bg-gradient-pulse text-black shadow-neon hover:shadow-glow',
      secondary:
        'bg-background-elevated text-text-primary hover:bg-opacity-80 hover:shadow-soft',
      ghost: 'text-text-primary hover:bg-background-elevated',
      danger: 'bg-accent-red text-white hover:bg-accent-red/90',
      outline:
        'border border-stroke-subtle/40 bg-background-card/70 text-text-primary hover:border-accent-blue/40',
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
          'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all',
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
            <span>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  })
)

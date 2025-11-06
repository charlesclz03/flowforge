import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  center?: boolean
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-full',
}

export function Container({ children, className, size = 'md', center = true }: ContainerProps) {
  return (
    <div
      className={cn(
        'w-full px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

const strokeClasses = {
  sm: 'border-2',
  md: 'border-3',
  lg: 'border-4',
}

export function Loading({ size = 'md', text, className }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <div
          className={cn(
            'absolute inset-0 rounded-full border-text-tertiary/20',
            strokeClasses[size]
          )}
        ></div>
        <div
          className={cn(
            'absolute inset-0 rounded-full border-accent-orange border-t-transparent animate-spin',
            strokeClasses[size]
          )}
        ></div>
      </div>
      {text && <p className="text-text-secondary text-sm">{text}</p>}
    </div>
  )
}


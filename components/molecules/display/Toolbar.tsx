import type { HTMLAttributes, ReactNode } from 'react'
import { Surface } from '@/components/atoms/Surface'
import { cn } from '@/lib/utils'

interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  leading?: ReactNode
  trailing?: ReactNode
  children?: ReactNode
}

export function Toolbar({
  leading,
  trailing,
  children,
  className,
  ...props
}: ToolbarProps) {
  return (
    <Surface
      tone="glass"
      padding="sm"
      className={cn(
        'flex min-h-[56px] items-center justify-between gap-3 rounded-2xl',
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {leading ?? children}
      </div>
      {trailing && (
        <div className="flex shrink-0 items-center gap-2">{trailing}</div>
      )}
    </Surface>
  )
}

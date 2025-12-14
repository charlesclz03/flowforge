'use client'

import { Music } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlowForgeWordmarkProps {
  size?: 'sm' | 'lg'
  className?: string
}

export function FlowForgeWordmark({ size = 'lg', className }: FlowForgeWordmarkProps) {
  const textClasses = size === 'lg' ? 'text-4xl sm:text-6xl' : 'text-2xl sm:text-3xl'
  const iconClasses = size === 'lg' ? 'h-12 w-12' : 'h-8 w-8'

  return (
    <div className={cn('inline-block', className)}>
      <div className="flex items-center justify-center space-x-3">
        <Music className={cn(iconClasses, 'text-accent-purple')} />
        <h1 className={cn(textClasses)}>
          Flow<span className="text-accent-purple">Forge</span>
        </h1>
      </div>
    </div>
  )
}



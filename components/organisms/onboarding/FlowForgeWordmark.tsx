'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'

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
        <Image
          src="/logo.png"
          alt="Freestyla Logo"
          width={48}
          height={48}
          className={cn(iconClasses, 'object-contain drop-shadow-neon')}
        />
        <h1 className={cn(textClasses)}>
          Free<span className="text-accent-purple">Styla</span>
        </h1>
      </div>
    </div>
  )
}

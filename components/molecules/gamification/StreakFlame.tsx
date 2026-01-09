'use client'

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakFlameProps {
  streak: number
  isActive?: boolean // Did they practice today?
  className?: string
}

export function StreakFlame({
  streak,
  isActive = false,
  className,
}: StreakFlameProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative">
        <Flame
          size={32}
          className={cn(
            'transition-all duration-500',
            isActive
              ? 'text-accent-gold drop-shadow-[0_0_10px_rgba(255,214,10,0.6)] fill-accent-gold'
              : 'text-text-tertiary'
          )}
        />
        {/* Inner Flame for depth if active */}
        {isActive && (
          <Flame
            size={16}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/80 fill-white"
          />
        )}
      </div>

      <span
        className={cn(
          'text-sm font-black mt-[-4px]',
          isActive ? 'text-accent-gold' : 'text-text-tertiary'
        )}
      >
        {streak}
      </span>
    </div>
  )
}

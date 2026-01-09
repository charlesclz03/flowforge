'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface XPBarProps {
  current: number
  max: number
  level?: number
  className?: string
  showLabel?: boolean
}

export function XPBar({
  current,
  max,
  level,
  className,
  showLabel = true,
}: XPBarProps) {
  const percentage = Math.min((current / max) * 100, 100)

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-bold uppercase tracking-wider">
          <span className="text-accent-purple">Lvl {level || 1}</span>
          <span className="text-text-secondary">
            {current}/{max} XP
          </span>
        </div>
      )}

      {/* Bar Container */}
      <div className="h-4 w-full bg-background-elevated rounded-full overflow-hidden border border-white/5 relative">
        {/* Fill */}
        <motion.div
          className="h-full bg-gradient-to-r from-accent-purple to-accent-violet relative"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 1 }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  )
}

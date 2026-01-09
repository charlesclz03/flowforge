'use client'

import { useEffect, useState } from 'react'
import { UI_CONFIG } from '@/lib/constants/design'
import { cn } from '@/lib/utils'

interface TimerRingProps {
  progress: number // 0 to 1
  size?: number
  strokeWidth?: number
  className?: string
  isSirenActive?: boolean
  sirenPhase?: number
}

export function TimerRing({
  progress,
  size = UI_CONFIG.TIMER_RING_SIZE,
  strokeWidth = UI_CONFIG.TIMER_RING_STROKE_WIDTH,
  className,
  isSirenActive = false,
  sirenPhase = 0,
}: TimerRingProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - progress * circumference

  if (!mounted) {
    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className={className}
        style={{ width: '100%', height: '100%' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          className="text-timer-background"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}
    >
      {/* Background ring - full circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        className="text-timer-background"
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="butt"
        className={cn(
          'transition-all duration-300 ease-linear',
          isSirenActive
            ? sirenPhase === 0
              ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
              : 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]'
            : 'text-timer-ring'
        )}
      />
    </svg>
  )
}

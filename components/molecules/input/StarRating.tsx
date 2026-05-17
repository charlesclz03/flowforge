'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange: (rating: number) => void
  disabled?: boolean
  size?: number
}

export function StarRating({
  value,
  onChange,
  disabled,
  size = 28,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  return (
    <div
      className="flex gap-1"
      onMouseLeave={() => setHoverValue(0)}
      role="radiogroup"
      aria-label="Rate your experience"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => !disabled && setHoverValue(star)}
          className={cn(
            'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300/70',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <Star
            size={size}
            className={cn(
              'transition-colors',
              (hoverValue || value) >= star
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-zinc-600 hover:text-yellow-400/50'
            )}
          />
        </button>
      ))}
    </div>
  )
}

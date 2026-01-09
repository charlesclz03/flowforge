'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface WordPromptProps {
  word: string | null
  show: boolean
  className?: string
  isGolden?: boolean
  isSirenActive?: boolean
}

export function WordPrompt({
  word,
  show,
  className,
  isGolden,
  isSirenActive,
}: WordPromptProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [displayWord, setDisplayWord] = useState<string | null>(null)

  useEffect(() => {
    if (show && word) {
      setDisplayWord(word)
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [show, word])

  if (!displayWord) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center min-h-[120px]',
        className
      )}
    >
      <div
        className={cn(
          'transition-all duration-300',
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        )}
      >
        <h2
          className={cn(
            'text-3xl sm:text-4xl font-light tracking-tight text-center transition-transform',
            isGolden
              ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]'
              : 'text-gradient',
            !isGolden && 'drop-shadow-lg',
            isSirenActive && 'animate-shake text-red-500'
          )}
        >
          {displayWord.toUpperCase()}
        </h2>
      </div>
    </div>
  )
}

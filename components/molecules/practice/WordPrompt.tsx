'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface WordPromptProps {
  word: string | null
  show: boolean
  className?: string
}

export function WordPrompt({ word, show, className }: WordPromptProps) {
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
    return (
      <div className={cn('flex items-center justify-center min-h-[120px]', className)}>
        <h2
          className={cn(
            'text-3xl sm:text-4xl font-light tracking-tight text-center',
            'text-gradient',
            'drop-shadow-lg'
          )}
        >
          READY
        </h2>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center min-h-[120px]', className)}>
      <div
        className={cn(
          'transition-all duration-300',
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        )}
      >
        <h2
          className={cn(
            'text-3xl sm:text-4xl font-light tracking-tight text-center',
            'text-gradient',
            'drop-shadow-lg'
          )}
        >
          {displayWord.toUpperCase()}
        </h2>
      </div>
    </div>
  )
}

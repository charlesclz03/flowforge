'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SafeAreaWrapperProps {
  children: React.ReactNode
  className?: string
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}

/**
 * A wrapper that applies safe area padding relative to the device's physical screen.
 * Critical for "No-Scroll" apps to avoid notches and home indicators.
 */
export const SafeAreaWrapper = ({
  children,
  className,
  top = true,
  bottom = true,
  left = true,
  right = true,
}: SafeAreaWrapperProps) => {
  return (
    <div
      className={cn(
        'relative flex flex-col w-full h-full',
        top && 'pt-[env(safe-area-inset-top)]',
        bottom && 'pb-[env(safe-area-inset-bottom)]',
        left && 'pl-[env(safe-area-inset-left)]',
        right && 'pr-[env(safe-area-inset-right)]',
        className
      )}
    >
      {/* 
        We use flex-grow to ensure the inner content takes up the remaining space 
        after safe areas are applied, enforcing the "Compressible Layout" logic 
        from the Audit.
      */}
      <div className="flex-1 w-full h-full relative flex flex-col">{children}</div>
    </div>
  )
}

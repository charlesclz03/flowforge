import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Avatar({
  src,
  alt = 'Avatar',
  fallback = '?',
  className,
  size = 'md',
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl md:h-32 md:w-32 md:text-4xl',
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full bg-surface-elevated border border-stroke-default flex items-center justify-center text-text-secondary font-bold shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {src ? <Image src={src} alt={alt} fill className="object-cover" /> : <span>{fallback}</span>}
    </div>
  )
}

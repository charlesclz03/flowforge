'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/atoms/Button'
import { toggleLike } from '@/app/actions/social'
import { Heart } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  sessionId: string
  initialIsLiked: boolean
  likeCount: number
  className?: string
}

export function LikeButton({
  sessionId,
  initialIsLiked,
  likeCount: initialLikeCount,
  className,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    // 1. Optimistic Update
    const newState = !isLiked
    setIsLiked(newState)
    setLikeCount((prev) => (newState ? prev + 1 : prev - 1))

    // 2. Server Action
    startTransition(async () => {
      try {
        const result = await toggleLike(sessionId)
        if (result.isLiked !== newState) {
          setIsLiked(result.isLiked)
          setLikeCount((prev) => (result.isLiked ? prev + 1 : prev - 1))
        }
      } catch (error) {
        // 4. Revert on error
        setIsLiked(!newState)
        setLikeCount((prev) => (!newState ? prev + 1 : prev - 1))
        toast.error('Failed to like session')
      }
    })
  }

  return (
    <button
      className={cn(
        'flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white',
        isLiked ? 'text-accent-red' : 'text-text-tertiary',
        className
      )}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleToggle()
      }}
      disabled={isPending}
      aria-label="Like session"
    >
      <Heart size={18} className={cn('transition-all', isLiked && 'fill-current scale-110')} />
      <span>{likeCount}</span>
    </button>
  )
}

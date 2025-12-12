'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/atoms/Button'
import { toggleFollow } from '@/app/actions/social'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface FollowButtonProps {
  targetUserId: string
  initialIsFollowing: boolean
  className?: string
}

export function FollowButton({ targetUserId, initialIsFollowing, className }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    // 1. Optimistic Update
    const newState = !isFollowing
    setIsFollowing(newState)

    // 2. Server Action
    startTransition(async () => {
      try {
        const result = await toggleFollow(targetUserId)
        // 3. Sync with source of truth (optional if we trust revalidation, but good for local state)
        // If the action returns the new state, we can set it.
        // However, if the component unmounts or path revalidates, specific local state might persist if not reset.
        // Since we are using state, we should rely on it, but use the result to confirm.
        if (result.isFollowing !== newState) {
          setIsFollowing(result.isFollowing)
        }
      } catch (error) {
        // 4. Revert on error
        setIsFollowing(!newState)
        toast.error('Failed to update follow status')
      }
    })
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'primary'}
      className={cn(
        'transition-all min-w-[100px]',
        isFollowing
          ? 'border-accent-purple text-accent-purple hover:bg-accent-purple/10'
          : 'bg-accent-purple hover:bg-accent-purple/90',
        className
      )}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}

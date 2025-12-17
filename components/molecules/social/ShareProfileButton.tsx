'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { useShare } from '@/hooks/useShare'

interface ShareProfileButtonProps {
  username: string
  userId: string
}

export function ShareProfileButton({ username, userId: _userId }: ShareProfileButtonProps) {
  const { share } = useShare()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-text-secondary hover:text-white"
      onClick={() =>
        share({
          title: `${username} on FlowForge`,
          text: `Check out ${username}'s flows!`,
          url: `${window.location.origin}/u/${username}`, // Or userId if using IDs
        })
      }
    >
      <Share2 size={20} />
    </Button>
  )
}

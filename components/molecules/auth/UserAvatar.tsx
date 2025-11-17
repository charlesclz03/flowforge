'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  className?: string
  mode?: 'full' | 'avatarOnly'
}

export function UserAvatar({ className = '', mode = 'full' }: UserAvatarProps) {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  const { name, email, image } = session.user
  const displayName = name || email?.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const wrapperClasses =
    mode === 'avatarOnly'
      ? cn('inline-flex items-center', className)
      : cn('flex items-center gap-3', className)

  return (
    <div className={wrapperClasses}>
      <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-cyan-500">
        {image ? (
          <Image src={image} alt={displayName} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
            {initials}
          </div>
        )}
      </div>
      {mode === 'full' && (
        <div className="hidden md:block">
          <p className="text-sm font-medium text-white">{displayName}</p>
          {email && <p className="text-xs text-gray-400">{email}</p>}
        </div>
      )}
    </div>
  )
}

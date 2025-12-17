'use client'

import Image from 'next/image'
import { Card } from '@/components/atoms/Card'

import { Edit2 } from 'lucide-react'
import { Button } from '@/components/atoms/Button'

interface User {
  name?: string | null
  email?: string | null
  image?: string | null
  username?: string | null
  bio?: string | null
}

interface AccountInfoProps {
  user: User
  onEdit?: () => void
}

export function AccountInfo({ user, onEdit }: AccountInfoProps) {
  return (
    <Card
      title="Profile Information"
      action={
        onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-text-secondary hover:text-white"
          >
            <Edit2 size={16} />
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* User Avatar and basic profile */}
        <div className="flex items-center gap-4">
          {user.image ? (
            <div className="relative h-20 w-20 flex-shrink-0">
              <Image
                src={user.image}
                alt={user.name || 'User'}
                fill
                sizes="80px"
                className="rounded-full border-2 border-accent-orange/20 object-cover"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-2xl font-semibold text-white">
              {user.username?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white truncate">{user.username || user.name}</h3>
            <p className="text-text-secondary text-sm truncate">{user.email}</p>
            {user.bio && (
              <p className="text-text-tertiary text-sm mt-2 line-clamp-2 italic">"{user.bio}"</p>
            )}
          </div>
        </div>

        {/* Account details */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-stroke-subtle/20 bg-background-elevated/50 p-4">
            <p className="text-sm text-text-tertiary">Email</p>
            <p className="mt-1 text-white truncate">{user.email}</p>
          </div>
          <div className="rounded-xl border border-stroke-subtle/20 bg-background-elevated/50 p-4">
            <p className="text-sm text-text-tertiary">Account Type</p>
            <p className="mt-1 text-white">Free Tier</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

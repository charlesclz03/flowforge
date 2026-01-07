'use client'

import Image from 'next/image'
import { Card } from '@/components/atoms/Card'

import { Edit2 } from 'lucide-react'
import { Button } from '@/components/atoms/Button'

import { Rank } from '@/lib/gamification/ranks'

interface User {
  name?: string | null
  email?: string | null
  image?: string | null
  username?: string | null
  bio?: string | null
  subscriptionStatus?: string | null
}

interface AccountInfoProps {
  user: User
  rank?: Rank
  onEdit?: () => void
}

export function AccountInfo({ user, rank, onEdit }: AccountInfoProps) {
  const isPro =
    user.subscriptionStatus === 'active' ||
    user.subscriptionStatus === 'trialing'

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
              {user.username?.[0]?.toUpperCase() ||
                user.name?.[0]?.toUpperCase() ||
                'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white truncate">
              {user.username || user.name}
            </h3>
            <p className="text-text-secondary text-sm truncate">{user.email}</p>
            {rank && (
              <div
                className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 ${rank.color}`}
              >
                {rank.name}
              </div>
            )}
            {user.bio && (
              <p className="text-text-tertiary text-sm mt-2 line-clamp-2 italic">
                "{user.bio}"
              </p>
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
            <p className="mt-1 text-white">
              {isPro ? (
                <span className="text-accent-purple font-bold">Pro Plan</span>
              ) : (
                'Free Tier'
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

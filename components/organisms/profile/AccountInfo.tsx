'use client'

import Image from 'next/image'
import { Card } from '@/components/atoms/Card'

import { Edit2 } from 'lucide-react'
import { Button } from '@/components/atoms/Button'

import { Rank } from '@/lib/gamification/ranks'
import { getLevelInfo } from '@/lib/gamification/xp'
import { isProUser } from '@/lib/subscription/isPro'

interface User {
  name?: string | null
  email?: string | null
  image?: string | null
  username?: string | null
  bio?: string | null
  subscriptionStatus?: string | null
  role?: string | null
  xp?: number
  level?: number
  createdAt?: Date
}

interface AccountInfoProps {
  user: User
  rank?: Rank
  onEdit?: () => void
}

export function AccountInfo({ user, rank, onEdit }: AccountInfoProps) {
  const isPro = isProUser(user)

  const xp = user.xp || 0

  // Use getLevelInfo for precise calculation
  const levelInfo = getLevelInfo(xp)
  const currentLevel = levelInfo.level
  const xpInCurrentLevel = levelInfo.currentXP
  const maxXPInLevel = levelInfo.maxXP
  const progressPercent = levelInfo.progress

  return (
    <Card
      title="Profile Information"
      action={
        <div className="flex items-center gap-2">
          {/* Level Indicator (Top Right) */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/20 mr-2">
            <span className="text-[10px] font-bold text-accent-gold uppercase tracking-wider">
              Lvl
            </span>
            <span className="text-sm font-black text-accent-gold">
              {currentLevel}
            </span>
          </div>

          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-text-secondary hover:text-white"
            >
              <Edit2 size={16} />
            </Button>
          )}
        </div>
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

            <div className="flex flex-wrap gap-2 mt-2">
              {rank && (
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 ${rank.color}`}
                >
                  {rank.name}
                </div>
              )}
              {isPro && (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-purple/10 border border-accent-purple/20 text-accent-purple">
                  PRO
                </div>
              )}
            </div>

            {user.bio && (
              <p className="text-text-tertiary text-sm mt-2 line-clamp-2 italic">
                "{user.bio}"
              </p>
            )}

            {/* XP Bar (Below Pills) */}
            <div className="mt-3 w-full max-w-[200px]">
              <div className="flex justify-between text-[10px] uppercase font-bold text-text-tertiary mb-1">
                <span>XP</span>
                <span>
                  {Math.round(xpInCurrentLevel).toLocaleString()} /{' '}
                  {Math.round(maxXPInLevel).toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-purple to-accent-blue rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
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

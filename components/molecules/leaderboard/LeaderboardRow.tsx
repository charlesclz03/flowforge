'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Trophy, Medal, User } from 'lucide-react'

interface LeaderboardRowProps {
  rank: number
  userId: string
  username: string
  image: string | null
  score: number
  isCurrentUser?: boolean
}

export function LeaderboardRow({
  rank,
  userId,
  username,
  image,
  score,
  isCurrentUser,
}: LeaderboardRowProps) {
  return (
    <Link
      href={`/u/${userId}`}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group',
        isCurrentUser
          ? 'bg-accent-purple/10 border-accent-purple/50'
          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
      )}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-8 text-center font-bold text-lg">
        {rank === 1 ? (
          <Trophy className="w-6 h-6 text-yellow-400 mx-auto" />
        ) : rank === 2 ? (
          <Medal className="w-6 h-6 text-gray-300 mx-auto" />
        ) : rank === 3 ? (
          <Medal className="w-6 h-6 text-amber-600 mx-auto" />
        ) : (
          <span className="text-text-secondary">#{rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
        {image ? (
          <Image src={image} alt={username} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <User size={20} className="text-white/50" />
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className={cn("font-medium truncate", isCurrentUser ? "text-accent-purple" : "text-white")}>
          {username}
        </div>
        {isCurrentUser && <div className="text-[10px] text-accent-purple/70">That's you!</div>}
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="font-bold text-accent-purple font-mono">{score.toLocaleString()}</div>
        <div className="text-[10px] text-text-tertiary">PTS</div>
      </div>
    </Link>
  )
}

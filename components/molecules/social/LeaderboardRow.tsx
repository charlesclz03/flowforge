import Link from 'next/link'
import { Avatar } from '@/components/atoms/Avatar'
import { Trophy, Medal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardRowProps {
  rank: number
  userId: string
  username: string
  image?: string | null
  score: number
  isCurrentUser?: boolean
}

export function LeaderboardRow({
  rank,
  // userId, // Unused
  username,
  image,
  score,
  isCurrentUser,
}: LeaderboardRowProps) {
  const getRankIcon = (r: number) => {
    if (r === 1) return <Trophy className="text-yellow-400 w-6 h-6" />
    if (r === 2) return <Medal className="text-gray-300 w-6 h-6" />
    if (r === 3) return <Medal className="text-amber-700 w-6 h-6" />
    return (
      <span className="font-numeral text-text-tertiary font-bold text-lg w-6 text-center">{r}</span>
    )
  }

  return (
    <Link
      href={`/u/${username}`}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl transition-all border',
        isCurrentUser
          ? 'bg-accent-purple/10 border-accent-purple/30 hover:bg-accent-purple/20'
          : 'bg-background-elevated border-white/5 hover:border-white/10 hover:bg-white/5'
      )}
    >
      <div className="flex items-center justify-center w-8 sm:w-12">{getRankIcon(rank)}</div>

      <Avatar src={image} fallback={username[0]} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-bold truncate',
              isCurrentUser ? 'text-accent-purple' : 'text-white'
            )}
          >
            {username}
          </span>
          {isCurrentUser && (
            <span className="text-[10px] uppercase bg-accent-purple/20 text-accent-purple px-1.5 py-0.5 rounded-sm">
              You
            </span>
          )}
        </div>
        <div className="text-xs text-text-tertiary">Flow Master</div>
      </div>

      <div className="text-right">
        <div className="font-numeral font-bold text-xl sm:text-2xl text-white">
          {score.toLocaleString()}
        </div>
        <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Sessions</div>
      </div>
    </Link>
  )
}

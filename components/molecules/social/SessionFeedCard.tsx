'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Avatar } from '@/components/atoms/Avatar'
import { Card } from '@/components/atoms/Card'
import { LikeButton } from './LikeButton'
import { MessageCircle, PlayCircle, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { CommentsDrawer } from './CommentsDrawer'

interface SessionFeedCardProps {
  session: {
    id: string
    title: string
    durationSeconds: number
    createdAt: Date
    beat: {
      title: string
    }
    user: {
      id: string
      name: string | null
      image: string | null
    }
    _count: {
      likes: number
      comments: number
    }
    isLikedByCurrentUser?: boolean
  }
}

export function SessionFeedCard({ session }: SessionFeedCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)

  return (
    <Card className="flex flex-col gap-4 p-5 hover:border-accent-purple/30 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/u/${session.user.id}`}>
          <Avatar
            src={session.user.image}
            fallback={session.user.name?.[0]?.toUpperCase() || 'U'}
            size="md"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/u/${session.user.id}`}
            className="block truncate font-semibold text-white hover:underline"
          >
            {session.user.name || 'Anonymous'}
          </Link>
          <p className="text-xs text-text-tertiary">
            {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Content Content - Linking to session detail (Phase 7 item? Or just plain view) -- assuming /recordings/[id] is detail view, or just modal? */}
      {/* CurrentMVP has /recordings page, but maybe we can link to a detailed view? Or just play here? For now, nice card. */}
      <div className="bg-surface-elevated/50 rounded-lg p-3 flex items-center justify-between group cursor-pointer hover:bg-surface-elevated transition-colors">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-accent-purple/20 p-2 rounded-full text-accent-purple">
            <PlayCircle size={24} />
          </div>
          <div className="truncate">
            <h4 className="font-medium text-text-primary truncate">{session.title}</h4>
            <p className="text-xs text-text-secondary truncate">
              {session.beat.title} • {Math.floor(session.durationSeconds)}s
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-6 pt-1 border-t border-stroke-subtle/30 mt-1">
        <LikeButton
          sessionId={session.id}
          initialIsLiked={!!session.isLikedByCurrentUser}
          likeCount={session._count.likes}
        />

        <button
          onClick={() => setIsCommentsOpen(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-text-tertiary hover:text-white transition-colors"
        >
          <MessageCircle size={18} />
          <span>{session._count.comments}</span>
        </button>

        <Link
          href={`/practice?mode=duel&challengeId=${session.id}`}
          className="ml-auto flex items-center gap-1.5 text-xs font-bold text-accent-cyan hover:text-white transition-colors uppercase tracking-wider bg-accent-cyan/10 hover:bg-accent-cyan/20 px-3 py-1.5 rounded-full"
        >
          <Zap size={14} className="fill-current" />
          Challenge
        </Link>
      </div>

      <CommentsDrawer
        sessionId={session.id}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
      />
    </Card>
  )
}

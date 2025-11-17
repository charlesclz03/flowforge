'use client'

import { StoredSession } from '@/lib/storage/types'
import { formatDuration, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Music, Play, Trash2 } from 'lucide-react'
import { SESSION_CONFIG } from '@/lib/constants/design'

interface SessionCardProps {
  session: StoredSession
  onPlay: (session: StoredSession) => void
  onDelete: (id: string) => void
  className?: string
}

export function SessionCard({ session, onPlay, onDelete, className }: SessionCardProps) {
  const difficultyLabel = SESSION_CONFIG.DIFFICULTY_LABELS[session.difficulty as 1 | 2 | 3]

  return (
    <div className={cn('card hover:border-text-tertiary/40 transition-all', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-background-elevated text-text-secondary flex-shrink-0">
            <Music size={24} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-text-primary truncate">{session.title}</h3>
            <p className="text-text-secondary text-sm">{session.beatTitle}</p>
            <div className="flex items-center space-x-2 mt-1 text-text-tertiary text-xs">
              <span>{formatDuration(session.durationSeconds)}</span>
              <span>·</span>
              <span>{session.beatBPM} BPM</span>
              <span>·</span>
              <span>{difficultyLabel}</span>
              <span>·</span>
              <span>{formatRelativeTime(session.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => onPlay(session)}
            className="p-2 rounded-lg text-accent-orange hover:bg-accent-orange/10 transition-colors"
            aria-label="Play"
          >
            <Play size={18} />
          </button>
          <button
            onClick={() => onDelete(session.id)}
            className="p-2 rounded-lg text-accent-red hover:bg-accent-red/10 transition-colors"
            aria-label="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

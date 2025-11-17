'use client'

import { StoredSession } from '@/lib/storage/types'
import { SessionCard } from '@/components/molecules/history/SessionCard'
import { cn } from '@/lib/utils'

interface SessionListProps {
  sessions: StoredSession[]
  onPlay: (session: StoredSession) => void
  onDelete: (id: string) => void
  emptyMessage?: string
  className?: string
}

export function SessionList({
  sessions,
  onPlay,
  onDelete,
  emptyMessage = 'No sessions yet',
  className,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-text-secondary">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} onPlay={onPlay} onDelete={onDelete} />
      ))}
    </div>
  )
}

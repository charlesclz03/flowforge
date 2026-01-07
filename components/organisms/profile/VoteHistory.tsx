'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { formatDistanceToNow } from 'date-fns'
import { Trophy } from 'lucide-react'

type Vote = {
  id: string
  createdAt: string
  winner: {
    title: string
    user: {
      name: string | null
      image: string | null
    }
  }
  duel: {
    title: string
  }
}

export function VoteHistory() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchVotes() {
      try {
        const res = await fetch('/api/user/votes')
        if (res.ok) {
          const data = await res.json()
          setVotes(data.votes)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVotes()
  }, [])

  if (isLoading)
    return (
      <div className="py-8 flex justify-center">
        <Spinner size="sm" />
      </div>
    )

  if (votes.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary bg-background-elevated rounded-xl border border-white/5">
        <p>No votes cast yet. Go watch some duels!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold mb-4">Your Voting History</h3>
      {votes.map((vote) => (
        <Card
          key={vote.id}
          className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-accent-gold/20 rounded-full text-accent-gold">
              <Trophy size={16} />
            </div>
            <div>
              <p className="font-medium text-sm">
                Voted for{' '}
                <span className="text-accent-gold">
                  {vote.winner.user.name || 'Unknown'}
                </span>
              </p>
              <p className="text-xs text-text-secondary">
                in duel "{vote.duel.title}"
              </p>
            </div>
          </div>
          <span className="text-xs text-text-tertiary">
            {formatDistanceToNow(new Date(vote.createdAt), { addSuffix: true })}
          </span>
        </Card>
      ))}
    </div>
  )
}

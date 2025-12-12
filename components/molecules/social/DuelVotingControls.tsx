'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface DuelVotingControlsProps {
  duelId: string
  defenderId: string
  challengerId: string
  defenderVotes: number
  challengerVotes: number
  userVotedForId: string | null
  isLoggedIn: boolean
}

export function DuelVotingControls({
  duelId,
  defenderId,
  challengerId,
  defenderVotes: initialDefenderVotes,
  challengerVotes: initialChallengerVotes,
  userVotedForId,
  isLoggedIn,
}: DuelVotingControlsProps) {
  const [hasVoted, setHasVoted] = useState(!!userVotedForId)
  const [defenderVotes, setDefenderVotes] = useState(initialDefenderVotes)
  const [challengerVotes, setChallengerVotes] = useState(initialChallengerVotes)
  const [isVoting, setIsVoting] = useState(false)
  const router = useRouter()

  const totalVotes = defenderVotes + challengerVotes
  const defenderPercent = totalVotes > 0 ? Math.round((defenderVotes / totalVotes) * 100) : 50
  const challengerPercent = totalVotes > 0 ? Math.round((challengerVotes / totalVotes) * 100) : 50

  const handleVote = async (votedForId: string) => {
    if (!isLoggedIn) {
      toast.error('Sign in to vote!')
      return
    }
    if (hasVoted) return

    setIsVoting(true)
    try {
      const res = await fetch('/api/duels/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duelId, votedForId }),
      })

      if (!res.ok) {
        if (res.status === 400) {
          // Already voted likely
          setHasVoted(true)
          toast('You already voted!')
        }
        throw new Error('Failed to vote')
      }

      setHasVoted(true)
      if (votedForId === defenderId) setDefenderVotes((p) => p + 1)
      else setChallengerVotes((p) => p + 1)

      toast.success('Vote cast!')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Could not cast vote')
    } finally {
      setIsVoting(false)
    }
  }

  if (hasVoted) {
    return (
      <div className="w-full grid  items-center gap-4 py-4 animate-in fade-in">
        {/* Simple Bar representation or just stats */}
        <div className="flex justify-between text-sm uppercase tracking-widest font-bold text-text-secondary mb-2">
          <span>{defenderPercent}%</span>
          <span>Community Vote</span>
          <span>{challengerPercent}%</span>
        </div>
        <div className="h-4 bg-surface-elevated rounded-full overflow-hidden flex w-full">
          <div
            className="h-full bg-secondary-cyan transition-all duration-1000 ease-out"
            style={{ width: `${defenderPercent}%` }}
          />
          <div
            className="h-full bg-accent-purple transition-all duration-1000 ease-out"
            style={{ width: `${challengerPercent}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center gap-12 py-4">
      <Button
        variant="outline"
        className="border-secondary-cyan text-secondary-cyan hover:bg-secondary-cyan/10 min-w-[120px]"
        onClick={() => handleVote(defenderId)}
        disabled={isVoting}
      >
        Vote Defender
      </Button>
      <Button
        variant="outline"
        className="border-accent-purple text-accent-purple hover:bg-accent-purple/10 min-w-[120px]"
        onClick={() => handleVote(challengerId)}
        disabled={isVoting}
      >
        Vote Challenger
      </Button>
    </div>
  )
}

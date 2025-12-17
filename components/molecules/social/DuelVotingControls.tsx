'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Vote, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface VotingControlsProps {
  duelId: string
  initialVotedFor?: string | null
  contestants: {
    id: string
    username: string
    role: 'defender' | 'challenger'
  }[]
}

export function DuelVotingControls({ duelId, initialVotedFor, contestants }: VotingControlsProps) {
  const [votedFor, setVotedFor] = useState<string | null>(initialVotedFor || null)
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (targetId: string) => {
    if (votedFor || isVoting) return
    setIsVoting(true)

    try {
      const res = await fetch('/api/duels/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duelId, votedForId: targetId }),
      })

      if (res.ok) {
        setVotedFor(targetId)
        toast.success('Vote Cast!')
      } else {
        toast.error('Failed to vote')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error voting')
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="bg-background-elevated/50 border border-white/5 rounded-2xl p-6 text-center backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
        <Vote className="text-accent-gold" />
        Cast Your Vote
      </h3>
      <p className="text-text-secondary mb-6 text-sm">Who won this battle? Decide the victor.</p>

      <div className="flex gap-4 justify-center">
        {contestants.map((c) => (
          <motion.button
            key={c.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleVote(c.id)}
            disabled={!!votedFor}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all w-32',
              votedFor === c.id
                ? 'bg-accent-gold/20 border-accent-gold text-white shadow-glow'
                : votedFor
                  ? 'opacity-50 border-white/5'
                  : 'bg-background-card border-white/10 hover:border-white/30 hover:bg-white/5'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold',
                c.role === 'defender'
                  ? 'bg-secondary-cyan/20 text-secondary-cyan'
                  : 'bg-accent-purple/20 text-accent-purple'
              )}
            >
              {votedFor === c.id ? <Trophy size={18} /> : c.username[0] || '?'}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">{c.role}</span>
          </motion.button>
        ))}
      </div>

      {votedFor && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-accent-gold font-medium text-sm"
        >
          Thanks for voting!
        </motion.div>
      )}
    </div>
  )
}

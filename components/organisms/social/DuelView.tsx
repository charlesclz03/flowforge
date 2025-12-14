'use client'

import { useState, useRef } from 'react'
import { FreestyleSession, User, Beat } from '@prisma/client'
import { Play, Pause, Vote } from 'lucide-react'
import { Card } from '@/components/atoms/Card'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'


type ExtendedSession = FreestyleSession & { user: User; beat?: Beat }

interface DuelViewProps {
  parentSession: ExtendedSession
  challengerSession: ExtendedSession
  parentVotes: number
  challengerVotes: number
}

export function DuelView({ parentSession, challengerSession, parentVotes, challengerVotes }: DuelViewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const parentVideoRef = useRef<HTMLVideoElement>(null)
  const challengerVideoRef = useRef<HTMLVideoElement>(null)
  const [hasVoted, setHasVoted] = useState(false) // Client-side check only for now

  // Sync Logic
  const togglePlay = () => {
    if (parentVideoRef.current && challengerVideoRef.current) {
      if (isPlaying) {
        parentVideoRef.current.pause()
        challengerVideoRef.current.pause()
      } else {
        // Reset to 0 if ended?
        // simple sync play
        parentVideoRef.current.play()
        challengerVideoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }
  
  const syncSeek = (time: number) => {
      // Sync seeking would be good polish, skip for MVP
  }

  const handleVote = async (votedForId: string) => {
      if (hasVoted) return
      
      try {
          // Use the Parent ID as the Duel Context
          const duelId = parentSession.id 
          const res = await fetch(`/api/duels/${duelId}/vote`, {
              method: 'POST',
              body: JSON.stringify({ votedForId })
          })
          
          if (res.ok) {
              setHasVoted(true)
              toast.success('Vote Cast!')
              // Optimistic update of counts ideally
          } else {
              toast.error('Failed to vote')
          }
      } catch (e) {
          toast.error('Error voting')
      }
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white italic tracking-tighter">
          DUEL
        </h1>
        <p className="text-text-secondary">
            {parentSession.user.username || 'OG'} vs {challengerSession.user.username || 'Challenger'}
        </p>
      </div>

      {/* Video Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
      
        {/* Play/Pause Overlay Button (Centered) */}
        <button 
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
        >
            {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
        </button>

        {/* Parent Side */}
        <div className="space-y-4">
            <Card padding="none" className="overflow-hidden aspect-[9/16] md:aspect-video relative group">
                <video 
                    ref={parentVideoRef}
                    src={parentSession.storageUrl || ''}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4">
                    <p className="font-bold text-white">{parentSession.user.username}</p>
                    <p className="text-xs text-text-tertiary">Defender</p>
                </div>
            </Card>
            
            <div className="flex items-center justify-between px-2">
                <div className="text-2xl font-bold text-white">{parentVotes} pts</div>
                <button 
                    onClick={() => handleVote(parentSession.id)}
                    className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                    <Vote size={18} />
                    Vote
                </button>
            </div>
        </div>

        {/* Challenger Side */}
        <div className="space-y-4">
            <Card padding="none" className="overflow-hidden aspect-[9/16] md:aspect-video relative group border-2 border-accent-gold/20">
                 <div className="absolute top-4 right-4 z-10 bg-accent-gold text-black text-xs font-bold px-2 py-1 rounded">
                    CHALLENGER
                </div>
                <video 
                    ref={challengerVideoRef}
                    src={challengerSession.storageUrl || ''}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                 <div className="absolute bottom-4 left-4">
                    <p className="font-bold text-white">{challengerSession.user.username}</p>
                    <p className="text-xs text-text-tertiary">Challenger</p>
                </div>
            </Card>
            
            <div className="flex items-center justify-between px-2">
                 <button 
                    onClick={() => handleVote(challengerSession.id)}
                    className="flex items-center gap-2 px-6 py-2 bg-accent-gold text-black font-bold rounded-full hover:bg-yellow-400 transition-colors"
                >
                    <Vote size={18} />
                    Vote
                </button>
                <div className="text-2xl font-bold text-accent-gold">{challengerVotes} pts</div>
            </div>
        </div>
      </div>
    </div>
  )
}

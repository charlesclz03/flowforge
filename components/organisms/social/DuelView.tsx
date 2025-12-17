'use client'

import { useState, useRef } from 'react'
import { FreestyleSession, User, Beat } from '@prisma/client'
import { Play, Pause, Vote } from 'lucide-react'
import { Card } from '@/components/atoms/Card'
// import { cn } from '@/lib/utils'
// import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

type ExtendedSession = FreestyleSession & { user: User; beat?: Beat }

interface DuelViewProps {
  parentSession: ExtendedSession
  challengerSession: ExtendedSession
  parentVotes: number
  challengerVotes: number
}

export function DuelView({
  parentSession,
  challengerSession,
  parentVotes,
  challengerVotes,
}: DuelViewProps) {
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

  /*
  const syncSeek = (time: number) => {
    // Sync seeking would be good polish, skip for MVP
  }
  */

  const handleVote = async (votedForId: string) => {
    if (hasVoted) return

    try {
      // Use the Parent ID as the Duel Context
      const duelId = parentSession.id
      const res = await fetch(`/api/duels/${duelId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ votedForId }),
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
        <h1 className="text-4xl font-black text-white italic tracking-tighter">DUEL</h1>
        <p className="text-text-secondary">
          {parentSession.user.username || 'OG'} vs {challengerSession.user.username || 'Challenger'}
        </p>
      </div>

      {/* Video Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* VS Badge (Absolute Center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none hidden md:flex items-center justify-center">
          <div className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 opacity-50 select-none">
            VS
          </div>
        </div>

        {/* Play/Pause Overlay Button (Centered) */}
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-2xl"
        >
          {isPlaying ? (
            <Pause fill="currentColor" />
          ) : (
            <Play fill="currentColor" className="ml-1" />
          )}
        </button>

        {/* Parent Side */}
        <div className="space-y-4">
          <Card
            padding="sm"
            className={`!p-0 overflow-hidden aspect-[9/16] md:aspect-video relative group transition-all duration-300 ${isPlaying ? 'shadow-glow-purple' : ''}`}
          >
            <video
              ref={parentVideoRef}
              src={parentSession.storageUrl || ''}
              className="w-full h-full object-cover"
              loop
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4">
              <p className="font-bold text-white text-lg">{parentSession.user.username}</p>
              <p className="text-xs text-accent-cyan font-bold uppercase tracking-wider">
                Defender (OG)
              </p>
            </div>
          </Card>

          <div className="flex items-center justify-between px-2 bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="text-2xl font-black text-white">{parentVotes}</div>
            <button
              onClick={() => handleVote(parentSession.id)}
              className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 hover:text-accent-cyan rounded-full transition-all font-bold group"
            >
              <Vote size={18} className="group-hover:-rotate-12 transition-transform" />
              Vote
            </button>
          </div>
        </div>

        {/* Challenger Side */}
        <div className="space-y-4">
          <Card
            padding="sm"
            className={`!p-0 overflow-hidden aspect-[9/16] md:aspect-video relative group border-2 border-accent-gold/20 transition-all duration-300 ${isPlaying ? 'shadow-glow-gold' : ''}`}
          >
            <div className="absolute top-4 right-4 z-10 bg-accent-gold text-black text-xs font-black px-3 py-1 rounded shadow-lg">
              CHALLENGER
            </div>
            <video
              ref={challengerVideoRef}
              src={challengerSession.storageUrl || ''}
              className="w-full h-full object-cover"
              loop
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4">
              <p className="font-bold text-white text-lg">{challengerSession.user.username}</p>
              <p className="text-xs text-accent-gold font-bold uppercase tracking-wider">
                Challenger
              </p>
            </div>
          </Card>

          <div className="flex items-center justify-between px-2 bg-accent-gold/5 p-3 rounded-xl border border-accent-gold/10">
            <button
              onClick={() => handleVote(challengerSession.id)}
              className="flex items-center gap-2 px-6 py-2 bg-accent-gold text-black font-bold rounded-full hover:bg-yellow-400 hover:scale-105 transition-all shadow-lg shadow-accent-gold/20 group"
            >
              <Vote size={18} className="group-hover:-rotate-12 transition-transform" />
              Vote
            </button>
            <div className="text-2xl font-black text-accent-gold">{challengerVotes}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

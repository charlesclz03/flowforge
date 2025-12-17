'use client'

import { useState } from 'react'
import { Beat, FreestyleSession, User } from '@prisma/client'
import { Card } from '@/components/atoms/Card'
import { Play, Pause, Heart, MessageCircle, Share2, Swords } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { AudioVisualizer } from '@/components/molecules/visuals/AudioVisualizer'
import { formatDistanceToNow } from 'date-fns'
import { useShare } from '@/hooks/useShare'

import { ReportDialog } from '@/components/molecules/interactions/ReportDialog'
import { MoreVertical, Flag } from 'lucide-react'

type FeedSession = FreestyleSession & {
  user: User
  beat: Beat
  _count?: {
    likes?: number
    comments?: number
  }
}

interface FeedItemProps {
  session: FeedSession
}

export function FeedItem({ session }: FeedItemProps) {
  const { share } = useShare()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  // Placeholder audio toggle
  const togglePlay = () => {
    // In a real app, this would coordinate with a global player context
    const audio = document.getElementById(`audio-${session.id}`) as HTMLAudioElement
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        // Pause all others?
        document.querySelectorAll('audio').forEach((a) => a.pause())
        audio.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <>
      <Card className="mb-6 overflow-hidden !p-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          {/* ... user avatar ... */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-white font-bold">
            {session.user.image ? (
              <Image
                src={session.user.image || ''}
                alt={session.user.username || 'User'}
                width={40}
                height={40}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              (session.user.username?.[0] || 'U').toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate">
              {session.user.username || 'Anonymous'}
            </h3>
            <p className="text-xs text-text-tertiary">
              {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
            </p>
          </div>

          {/* Report / Options */}
          <div className="relative group/menu">
            <button
              className="p-2 text-text-tertiary hover:text-white transition-colors"
              aria-label="More options"
            >
              <MoreVertical size={20} />
            </button>
            {/* Simple Hover Menu for MVP */}
            <div className="absolute right-0 top-full mt-1 w-32 bg-background-elevated border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
              <button
                onClick={() => setIsReportOpen(true)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 text-left"
              >
                <Flag size={14} />
                Report
              </button>
            </div>
          </div>
        </div>

        {/* ... Rest of Content ... */}
        {/* Helper function to rendering rest is annoying with replace_file_content if I don't select meticulously. */}
        {/* I will use the existing content below but assume I replace the entire file content or specific blocks carefully. */}
        {/* Actually, replacing the Header block is safer if I can match it. */}
        {/* But I need to wrap the whole return in Fragment to put Dialog outside? yes. */}

        {/* Since I am using replace_file_content with range, I can't wrap the whole component easily without rewriting it all. */}
        {/* Strategy: Wrap Card in Fragment conceptually in my head? No, I must edit the code structure. */}
        {/* Simpler: Put Dialog inside Card? It uses Portal so it's fine. */}
        {/* I will just append the Dialog at the end of the return JSX. */}

        {/* Content / Visualizer Area */}
        <div
          className="relative aspect-video bg-black/40 group cursor-pointer"
          onClick={togglePlay}
          role="button"
          tabIndex={0}
          aria-label={`Play beat ${session.beat.title}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              togglePlay()
            }
          }}
        >
          {/* ... Same as before ... */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 to-transparent opacity-50" />

          {/* Active Visualizer */}
          <div className="absolute inset-0 opacity-60">
            <AudioVisualizer isPlaying={isPlaying} mode="simulation" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-transform duration-200 ${isPlaying ? 'scale-95' : 'scale-100 group-hover:scale-110'}`}
            >
              {isPlaying ? (
                <Pause className="fill-white text-white" />
              ) : (
                <Play className="fill-white text-white ml-1" />
              )}
            </div>
          </div>

          {/* Beat Info Tag */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white/90 border border-white/10 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full bg-accent-gold ${isPlaying ? 'animate-pulse' : ''}`}
            />
            {session.beat.title}
          </div>

          <audio
            id={`audio-${session.id}`}
            src={session.storageUrl || ''}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => {
                // Optimistic toggle
                const heart = document.getElementById(`heart-${session.id}`)
                heart?.classList.toggle('text-accent-pink')
                heart?.classList.toggle('fill-accent-pink')
              }}
              className="flex items-center gap-2 text-text-secondary hover:text-accent-pink transition-colors group"
              aria-label={`${session._count?.likes || 0} Likes`}
            >
              <Heart
                id={`heart-${session.id}`}
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="text-sm font-medium">{session._count?.likes || 0}</span>
            </motion.button>
            <button
              className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
              aria-label={`${session._count?.comments || 0} Comments`}
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium">{session._count?.comments || 0}</span>
            </button>
            <Link
              href={`/practice?beatId=${session.beat.id}&parentId=${session.id}`}
              className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors"
              title="Duel this flow"
              aria-label="Duel this flow"
            >
              <Swords size={20} />
              <span className="text-sm font-medium">Duel</span>
            </Link>
          </div>
          <button
            onClick={() =>
              share({
                title: `Flow by ${session.user.username}`,
                text: `Check out this freestyle on FlowForge!`,
                url: `${window.location.origin}/s/${session.id}`,
              })
            }
            className="text-text-secondary hover:text-white transition-colors"
            aria-label="Share this flow"
          >
            <Share2 size={20} />
          </button>
        </div>
      </Card>
      <ReportDialog
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        contentId={session.id}
        contentType="session"
      />
    </>
  )
}

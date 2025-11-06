'use client'

import { useEffect, useState } from 'react'
import { StoredSession } from '@/lib/storage/types'
import { DurationDisplay } from './DurationDisplay'
import { Play, Pause, X } from 'lucide-react'
import { getSessionAudioBlob } from '@/lib/storage/sessions'
import { cn } from '@/lib/utils'

interface SessionPlayerProps {
  session: StoredSession
  onClose: () => void
  className?: string
}

export function SessionPlayer({ session, onClose, className }: SessionPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    const blob = getSessionAudioBlob(session)
    const url = URL.createObjectURL(blob)
    const audioElement = new Audio(url)

    audioElement.addEventListener('ended', () => setIsPlaying(false))
    setAudio(audioElement)

    return () => {
      URL.revokeObjectURL(url)
      audioElement.pause()
      audioElement.remove()
    }
  }, [session])

  const togglePlayback = () => {
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className={cn('card p-4 space-y-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text-primary truncate">{session.title}</h3>
          <p className="text-text-secondary text-sm">{session.beatTitle}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-text-secondary hover:bg-background-elevated transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={togglePlayback}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-accent-orange text-black transition-all hover:scale-105 active:scale-95"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
        </button>

        <DurationDisplay duration={session.durationSeconds} label="" />
      </div>
    </div>
  )
}

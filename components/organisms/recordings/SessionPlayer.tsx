'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface SessionPlayerProps {
  audioUrl: string | null
  className?: string
}

export function SessionPlayer({ audioUrl, className }: SessionPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioUrl) return

    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
    })

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [audioUrl])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const time = parseFloat(e.target.value)
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const val = parseFloat(e.target.value)
    setVolume(val)
    audioRef.current.volume = val
    setIsMuted(val === 0)
  }

  const skipForward = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.min(
      audioRef.current.duration,
      audioRef.current.currentTime + 10
    )
  }

  const skipBackward = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
  }

  if (!audioUrl) {
    return (
      <div className="p-8 text-center text-text-tertiary bg-background-card rounded-xl border border-white/5">
        Audio not available
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-background-elevated rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl',
        className
      )}
    >
      {/* Main Controls - Centered */}
      <div className="flex flex-col items-center justify-center mb-8 gap-6">
        {/* Time Display */}
        <div className="text-4xl font-light font-numeral text-accent-purple tracking-wider tabular-nums">
          {formatDuration(Math.round(currentTime))}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={skipBackward}
            className="p-3 text-text-secondary hover:text-white transition-colors hover:bg-white/5 rounded-full"
            aria-label="Skip Back 10s"
          >
            <SkipBack size={24} />
          </button>

          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-accent-purple text-white flex items-center justify-center hover:bg-accent-purple/90 hover:scale-105 transition-all shadow-glow-purple"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={32} fill="currentColor" />
            ) : (
              <Play size={32} fill="currentColor" className="ml-1" />
            )}
          </button>

          <button
            onClick={skipForward}
            className="p-3 text-text-secondary hover:text-white transition-colors hover:bg-white/5 rounded-full"
            aria-label="Skip Forward 10s"
          >
            <SkipForward size={24} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 group">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-background-card rounded-lg appearance-none cursor-pointer accent-accent-purple"
          style={{
            backgroundSize: `${(currentTime * 100) / (duration || 1)}% 100%`,
          }}
        />
        <div className="flex justify-between text-xs text-text-tertiary mt-2 font-mono">
          <span>{formatDuration(Math.round(currentTime))}</span>
          <span>{formatDuration(Math.round(duration))}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex justify-end items-center gap-2">
        <button onClick={toggleMute} className="text-text-secondary hover:text-white">
          {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-background-card rounded-lg appearance-none cursor-pointer accent-white/50 hover:accent-white"
        />
      </div>
    </div>
  )
}

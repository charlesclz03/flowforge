'use client'

import { useState, useRef } from 'react'
import { Play, Pause, Share2, Heart } from 'lucide-react'
import { AudioVisualizer } from '@/components/molecules/visuals/AudioVisualizer'
import { formatDuration } from '@/lib/utils'
import { useShare } from '@/hooks/useShare'
import Image from 'next/image'

interface SharedSessionPlayerProps {
  title: string
  artist: string
  audioUrl: string
  avatarUrl: string | null
  duration: number
  likes: number
}

export function SharedSessionPlayer({
  title,
  artist,
  audioUrl,
  avatarUrl,
  duration,
  likes,
}: SharedSessionPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { share } = useShare()

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime
      const total = audioRef.current.duration || duration
      setProgress((current / total) * 100)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setProgress(0)
  }

  return (
    <div className="relative bg-black/40 aspect-video group cursor-pointer" onClick={togglePlay}>
      {/* Background & Visualizer */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-transparent" />
      <div className="absolute inset-0 opacity-60">
        <AudioVisualizer isPlaying={isPlaying} mode="simulation" />
      </div>

      {/* Center Play Button */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div
          className={`w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
            isPlaying ? 'scale-95 opacity-50 hover:opacity-100' : 'scale-100 hover:scale-110'
          }`}
        >
          {isPlaying ? (
            <Pause className="fill-white text-white w-8 h-8" />
          ) : (
            <Play className="fill-white text-white w-8 h-8 ml-1" />
          )}
        </div>
      </div>

      {/* Info Overlay (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-white font-bold border border-white/20">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={artist}
                  width={40}
                  height={40}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (artist[0] || 'U').toUpperCase()
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">{title}</h3>
              <p className="text-text-secondary text-sm">by {artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-white/80">
              <Heart size={16} className={likes > 0 ? 'fill-accent-pink text-accent-pink' : ''} />
              <span className="text-sm font-medium">{likes}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                share({
                  title: `Freestyle by ${artist}`,
                  text: `Listening to ${title} by ${artist} on FlowForge`,
                  url: window.location.href,
                })
              }}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-cyan transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-tertiary mt-1 font-mono">
          <span>{formatDuration(audioRef.current?.currentTime || 0)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  )
}

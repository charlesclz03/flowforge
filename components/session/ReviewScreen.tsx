'use client'

import { useState, useEffect } from 'react'
import { DurationDisplay } from './DurationDisplay'
import { cn } from '@/lib/utils'
import { Download, Save, X, Play as PlayIcon, Pause } from 'lucide-react'

interface ReviewScreenProps {
  audioBlob: Blob
  duration: number
  beatTitle: string
  onSave: (title: string) => void
  onDiscard: () => void
  className?: string
}

export function ReviewScreen({
  audioBlob,
  duration,
  beatTitle,
  onSave,
  onDiscard,
  className,
}: ReviewScreenProps) {
  const [title, setTitle] = useState(`${beatTitle} - ${new Date().toLocaleDateString()}`)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio URL from blob
    const url = URL.createObjectURL(audioBlob)
    setAudioUrl(url)

    const audioElement = new Audio(url)
    audioElement.addEventListener('ended', () => setIsPlaying(false))
    setAudio(audioElement)

    return () => {
      URL.revokeObjectURL(url)
      audioElement.pause()
      audioElement.remove()
    }
  }, [audioBlob])

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

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim())
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return

    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `${title}.webm`
    a.click()
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-light">Session Complete!</h2>
        <DurationDisplay duration={duration} label="Duration" />
      </div>

      {/* Playback Controls */}
      <div className="card p-6 space-y-4">
        <button
          onClick={togglePlayback}
          className="w-full py-4 rounded-xl bg-accent-orange text-black font-medium transition-all hover:bg-opacity-90 active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          {isPlaying ? (
            <>
              <Pause size={20} />
              <span>Pause</span>
            </>
          ) : (
            <>
              <PlayIcon size={20} />
              <span>Play Recording</span>
            </>
          )}
        </button>
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <label className="text-sm text-text-secondary">Session Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          placeholder="Enter a title..."
          maxLength={50}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onDiscard}
          className="btn-secondary py-3 flex items-center justify-center space-x-2"
        >
          <X size={18} />
          <span>Discard</span>
        </button>

        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="btn-primary py-3 flex items-center justify-center space-x-2"
        >
          <Save size={18} />
          <span>Save</span>
        </button>
      </div>

      <button
        onClick={handleDownload}
        className="btn-ghost w-full py-3 flex items-center justify-center space-x-2"
      >
        <Download size={18} />
        <span>Download</span>
      </button>
    </div>
  )
}


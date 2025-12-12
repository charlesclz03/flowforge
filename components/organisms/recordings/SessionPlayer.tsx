'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Sparkles,
  Clock,
  RefreshCcw,
  Eye,
  EyeOff,
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'

// Impulse response for reverb (simple noise burst fallback or load file)
const createReverb = (ctx: AudioContext, duration: number = 2, decay: number = 2) => {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const impulse = ctx.createBuffer(2, length, sampleRate)
  const impulseL = impulse.getChannelData(0)
  const impulseR = impulse.getChannelData(1)

  for (let i = 0; i < length; i++) {
    const n = i < length ? Math.pow(1 - i / length, decay) : 0
    impulseL[i] = (Math.random() * 2 - 1) * n
    impulseR[i] = (Math.random() * 2 - 1) * n
  }
  return impulse
}

interface SessionPlayerProps {
  audioUrl: string | null
  beatUrl?: string | null
  className?: string
}

export function SessionPlayer({ audioUrl, beatUrl, className }: SessionPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [beatVolume, setBeatVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)

  // Advanced Features
  const [nudge, setNudge] = useState(0)
  const [isStudioMode, setIsStudioMode] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Clean View / Cinema Mode
  const [isCleanView, setIsCleanView] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const beatRef = useRef<HTMLAudioElement | null>(null)

  // Web Audio Refs
  const contextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const reverbRef = useRef<ConvolverNode | null>(null)
  const dryGainRef = useRef<GainNode | null>(null)
  const wetGainRef = useRef<GainNode | null>(null)

  // Load latency from calibration
  useEffect(() => {
    const saved = localStorage.getItem('flowforge_latency')
    if (saved) {
      // If latency is 50ms, it means I RECORD LATE.
      // So I need to pull vocals BACK (negative nudge relative to beat).
      // Or delay beat by 50ms.
      // Nudge here effectively delays the BEAT track.
      // If I am late (recorded after beat), I want to delay the BEAT to match my vocal.
      // So Latency = Positive Nudge.
      setNudge(parseInt(saved))
    }
  }, [])

  // dedicated effect for beat volume
  useEffect(() => {
    if (beatRef.current) {
      beatRef.current.volume = beatVolume
    }
  }, [beatVolume])

  useEffect(() => {
    if (!audioUrl) return

    const audio = new Audio(audioUrl)
    audioRef.current = audio
    audio.crossOrigin = 'anonymous' // Enable Web Audio API

    // Initialize beat audio if URL provided
    if (beatUrl) {
      const beat = new Audio(beatUrl)
      beat.volume = beatVolume
      beatRef.current = beat
    }

    // Initialize Web Audio Context for Studio FX
    const initAudioContext = () => {
      if (!contextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        contextRef.current = new AudioContext()
      }
    }

    audio.addEventListener('play', initAudioContext)

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
    })

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
      // Sync beat with Nudge
      // If nudge is 100ms, beat should be at audio.currentTime - 0.1
      // Wait, if I recorded LATE, I want the beat to play LATER to match me.
      // So Beat Time should be BEHIND Audio Time?
      // No, if Beat is at 10s, and I recorded at 10.1s.
      // I want Beat to be at 10s when Vocal is at 10.1s.
      // So Beat = Vocal - Latency.
      if (beatRef.current) {
        const targetTime = audio.currentTime - nudge / 1000
        // Only sync if significant drift
        if (Math.abs(beatRef.current.currentTime - targetTime) > 0.05) {
          // Handle edge case where target < 0
          if (targetTime >= 0) {
            beatRef.current.currentTime = targetTime
          }
        }
      }
    })

    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      setCurrentTime(0)
      if (beatRef.current) {
        beatRef.current.pause()
        beatRef.current.currentTime = 0
      }
    })

    return () => {
      audio.pause()
      audio.src = ''
      if (beatRef.current) {
        beatRef.current.pause()
        beatRef.current.src = ''
      }
    }
  }, [audioUrl, beatUrl, nudge])

  // Studio FX Effect
  useEffect(() => {
    if (!isStudioMode || !audioRef.current || !contextRef.current) return

    const ctx = contextRef.current
    if (!sourceRef.current) {
      sourceRef.current = ctx.createMediaElementSource(audioRef.current)
    }

    // Create nodes if needed
    if (!reverbRef.current) {
      reverbRef.current = ctx.createConvolver()
      reverbRef.current.buffer = createReverb(ctx)
      dryGainRef.current = ctx.createGain()
      wetGainRef.current = ctx.createGain()

      // Routing: Source -> Dry -> Dest
      //          Source -> Convolver -> Wet -> Dest
      sourceRef.current.connect(dryGainRef.current)
      dryGainRef.current.connect(ctx.destination)

      sourceRef.current.connect(reverbRef.current)
      reverbRef.current.connect(wetGainRef.current)
      wetGainRef.current.connect(ctx.destination)
    }

    // DRY/WET Mix
    if (isStudioMode) {
      dryGainRef.current!.gain.value = 0.8
      wetGainRef.current!.gain.value = 0.3 // 30% Reverb
    } else {
      // Bypass? Actually we might need to disconnect to truly bypass properly or just mute wet
    }
  }, [isStudioMode])

  // Reset/Bypass FX when disabled
  useEffect(() => {
    if (!contextRef.current || !dryGainRef.current || !wetGainRef.current) return

    if (isStudioMode) {
      dryGainRef.current.gain.value = 0.8
      wetGainRef.current.gain.value = 0.3
    } else {
      dryGainRef.current.gain.value = 1
      wetGainRef.current.gain.value = 0
    }
  }, [isStudioMode])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      if (beatRef.current) beatRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      if (beatRef.current) beatRef.current.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const time = parseFloat(e.target.value)
    audioRef.current.currentTime = time
    if (beatRef.current) beatRef.current.currentTime = time
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

  const handleBeatVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!beatRef.current) return
    const val = parseFloat(e.target.value)
    setBeatVolume(val)
    beatRef.current.volume = val
  }

  const skipForward = () => {
    if (!audioRef.current) return
    const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10)
    audioRef.current.currentTime = newTime
    if (beatRef.current) beatRef.current.currentTime = newTime
  }

  const skipBackward = () => {
    if (!audioRef.current) return
    const newTime = Math.max(0, audioRef.current.currentTime - 10)
    audioRef.current.currentTime = newTime
    if (beatRef.current) beatRef.current.currentTime = newTime
  }

  const resetPlayback = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
    }
    if (beatRef.current) {
      beatRef.current.currentTime = 0
    }
  }

  if (!audioUrl) {
    return (
      <div className="p-8 text-center text-text-tertiary bg-background-card rounded-xl border border-white/5">
        Audio not available
      </div>
    )
  }

  // Clean View Component (Simplified)
  if (isCleanView) {
    return (
      <div
        className={cn(
          'bg-black rounded-2xl p-8 border border-white/5 shadow-2xl flex flex-col items-center justify-center gap-8 relative overflow-hidden',
          className
        )}
      >
        {/* Simple Visualizer Placeholder */}
        <div className="absolute inset-0 bg-gradient-pulse opacity-20 animate-pulse" />

        <div className="relative z-10 text-center space-y-2">
          <div className="text-6xl font-light font-numeral text-white tracking-widest tabular-nums">
            {formatDuration(Math.round(currentTime))}
          </div>
          <div className="text-sm text-text-secondary tracking-[0.2em] uppercase">Now Playing</div>
        </div>

        <div className="relative z-10 flex gap-6">
          <button
            onClick={resetPlayback}
            className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <RefreshCcw size={24} />
          </button>
          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-accent-purple text-white hover:scale-105 transition-all"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>
        </div>

        <button
          onClick={() => setIsCleanView(false)}
          className="absolute top-4 right-4 p-2 text-text-tertiary hover:text-white transition-colors"
        >
          <Eye size={20} />
        </button>
      </div>
    )
  }

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      }
      // 'R' key for future recording shortcut if needed, or restart?
      // For now, let's map 'R' to Restart for quick retry
      if (e.code === 'KeyR') {
        e.preventDefault()
        resetPlayback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay])

  return (
    <div
      className={cn(
        'bg-background-elevated rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl relative',
        className
      )}
    >
      {/* Clean View Toggle */}
      <button
        onClick={() => setIsCleanView(true)}
        className="absolute top-4 right-4 p-2 text-text-tertiary hover:text-white transition-colors"
        title="Cinema Mode (Clean View)"
      >
        <EyeOff size={18} />
      </button>
      {/* Main Controls - Centered */}
      <div className="flex flex-col items-center justify-center mb-8 gap-6">
        {/* Time Display */}
        <div className="text-4xl font-light font-numeral text-accent-purple tracking-wider tabular-nums">
          {formatDuration(Math.round(currentTime))}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={resetPlayback}
            className="hidden md:block p-3 text-text-secondary hover:text-white transition-colors hover:bg-white/5 rounded-full"
            aria-label="Restart"
          >
            <RefreshCcw size={20} />
          </button>

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
      <div className="flex flex-col gap-4">
        {/* Main Volume (Vocals) */}
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs text-text-secondary uppercase tracking-wider w-16">Vocals</span>
          <div className="flex items-center gap-2 flex-1">
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
              className="w-full h-1 bg-background-card rounded-lg appearance-none cursor-pointer accent-white/50 hover:accent-white"
            />
          </div>
        </div>

        {/* Beat Volume (Mixer) */}
        {beatUrl && (
          <div className="flex justify-between items-center gap-4">
            <span className="text-xs text-text-secondary uppercase tracking-wider w-16">Beat</span>
            <div className="flex items-center gap-2 flex-1">
              <Volume2 size={18} className="text-text-secondary" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={beatVolume}
                onChange={handleBeatVolumeChange}
                className="w-full h-1 bg-background-card rounded-lg appearance-none cursor-pointer accent-accent-purple/50 hover:accent-accent-purple"
              />
            </div>
          </div>
        )}
      </div>

      {/* Advanced Controls Toggle */}
      <div className="mt-6 border-t border-white/5 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-text-tertiary hover:text-white flex items-center gap-2 w-full justify-center transition-colors"
        >
          {showAdvanced ? 'Hide Studio Tools' : 'Show Studio Tools'}
        </button>

        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
            {/* Studio FX */}
            <div className="bg-background-card p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles
                  className={cn(
                    'w-5 h-5',
                    isStudioMode ? 'text-accent-blue' : 'text-text-secondary'
                  )}
                />
                <div>
                  <div className="text-sm text-white font-medium">Studio FX</div>
                  <div className="text-xs text-text-tertiary">Add Reverb & Polish</div>
                </div>
              </div>
              <button
                onClick={() => setIsStudioMode(!isStudioMode)}
                className={cn(
                  'w-10 h-6 rounded-full transition-colors relative',
                  isStudioMode ? 'bg-accent-blue' : 'bg-white/10'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    isStudioMode ? 'left-5' : 'left-1'
                  )}
                />
              </button>
            </div>

            {/* Nudge / Latency */}
            <div className="bg-background-card p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-accent-pink" />
                  <span className="text-sm font-medium">Vocal Timing</span>
                </div>
                <span className="text-xs font-mono text-accent-pink">
                  {nudge > 0 ? `+${nudge}` : nudge}ms
                </span>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                step="10"
                value={nudge}
                onChange={(e) => setNudge(parseInt(e.target.value))}
                className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-accent-pink"
              />
              <div className="flex justify-between text-[10px] text-text-tertiary uppercase">
                <span>Early</span>
                <span>Late</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

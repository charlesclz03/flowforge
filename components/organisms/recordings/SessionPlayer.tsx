import {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'
import {
  Play,
  Pause,
  Volume2,
  SkipBack,
  SkipForward,
  Sparkles,
  Disc,
} from 'lucide-react'
import { formatDuration, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { WaveformScrubber } from '@/components/molecules/practice/WaveformScrubber'
import { SeamlessLooper } from '@/lib/audio/seamless-looper'

// Impulse response for reverb (simple noise burst fallback or load file)
const createReverb = (
  ctx: AudioContext,
  duration: number = 2,
  decay: number = 2
) => {
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

export interface SessionPlayerHandles {
  getSettings: () => {
    voiceVolume: number
    beatVolume: number
    isStudioMode: boolean
  }
}

interface SessionPlayerProps {
  audioUrl: string | null
  beatUrl?: string | null
  beatOffsetMs?: number // Beat position (ms) when recording started - for sync
  className?: string
  // Metadata props for integrated display
  beatTitle?: string
  beatBpm?: number
  beatArtist?: string
  sessionDuration?: number
  sessionDifficulty?: number
  sessionDate?: string | Date
  initialSettings?: {
    voiceVolume?: number
    beatVolume?: number
    isStudioMode?: boolean
    nudge?: number
  }
}

export const SessionPlayer = forwardRef<
  SessionPlayerHandles,
  SessionPlayerProps
>(
  (
    {
      audioUrl,
      beatUrl,
      beatOffsetMs = 0,
      className,
      beatTitle,
      beatBpm,
      beatArtist,
      sessionDuration,
      sessionDate,
      initialSettings,
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(sessionDuration || 0)
    const [currentTime, setCurrentTime] = useState(0)
    const [volume, setVolume] = useState(initialSettings?.voiceVolume ?? 1)
    const [beatVolume, setBeatVolume] = useState(
      initialSettings?.beatVolume ?? 0.8
    )
    const [isMuted, setIsMuted] = useState(false)
    const [audioError, setAudioError] = useState<string | null>(null)

    // Advanced Features
    const [nudge, setNudge] = useState(initialSettings?.nudge ?? 0)
    const nudgeRef = useRef(initialSettings?.nudge ?? 0) // Ref to avoid re-creating audio on nudge change
    const [isStudioMode, setIsStudioMode] = useState(
      initialSettings?.isStudioMode ?? true
    )

    // Expose settings to parent (e.g. for downloading mix)
    useImperativeHandle(ref, () => ({
      getSettings: () => ({
        voiceVolume: isMuted ? 0 : volume,
        beatVolume,
        isStudioMode,
      }),
    }))

    const audioRef = useRef<HTMLAudioElement | null>(null)
    // Use SeamlessLooper for gapless beat looping
    const beatLooperRef = useRef<SeamlessLooper | null>(null)

    // Web Audio Refs
    const contextRef = useRef<AudioContext | null>(null)
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
    const reverbRef = useRef<ConvolverNode | null>(null)
    const dryGainRef = useRef<GainNode | null>(null)
    const wetGainRef = useRef<GainNode | null>(null)

    // Load latency from calibration
    useEffect(() => {
      // Migrate legacy key if present (from old Latency Wizard)
      const legacyKey = localStorage.getItem('flowforge_audio_latency_ms')
      if (legacyKey && !localStorage.getItem('flowforge_latency')) {
        localStorage.setItem('flowforge_latency', legacyKey)
        localStorage.removeItem('flowforge_audio_latency_ms')
      }

      const saved = localStorage.getItem('flowforge_latency')
      if (saved) {
        const val = parseInt(saved)
        setNudge(val)
        nudgeRef.current = val
      }
    }, [])

    // Keep nudgeRef in sync with state changes
    useEffect(() => {
      nudgeRef.current = nudge
    }, [nudge])

    // dedicated effect for beat volume
    useEffect(() => {
      if (beatLooperRef.current) {
        beatLooperRef.current.setVolume(beatVolume)
      }
    }, [beatVolume])

    // Initialize Web Audio Context for Studio FX
    const initAudioGraph = useCallback(() => {
      if (!audioRef.current) return

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext

      if (!contextRef.current) {
        contextRef.current = new AudioContextClass()
      }

      const ctx = contextRef.current

      // Resume context if suspended (browser policy)
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      // Create Source Node (Only once per audio element)
      if (!sourceRef.current) {
        try {
          sourceRef.current = ctx.createMediaElementSource(audioRef.current)
        } catch (e) {
          // Source might already exist for this element
        }
      }

      // Create FX Nodes (Idempotent)
      if (!reverbRef.current) {
        reverbRef.current = ctx.createConvolver()
        reverbRef.current.buffer = createReverb(ctx)

        dryGainRef.current = ctx.createGain()
        wetGainRef.current = ctx.createGain() // Reverb level

        if (sourceRef.current) {
          sourceRef.current.connect(dryGainRef.current)
          dryGainRef.current.connect(ctx.destination)

          sourceRef.current.connect(reverbRef.current)
          reverbRef.current.connect(wetGainRef.current)
          wetGainRef.current.connect(ctx.destination)
        }
      }

      // Update mix based on mode
      if (dryGainRef.current && wetGainRef.current) {
        if (isStudioMode) {
          dryGainRef.current.gain.setTargetAtTime(0.7, ctx.currentTime, 0.1)
          wetGainRef.current.gain.setTargetAtTime(0.4, ctx.currentTime, 0.1)
        } else {
          dryGainRef.current.gain.setTargetAtTime(1.0, ctx.currentTime, 0.1)
          wetGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.1)
        }
      }
    }, [isStudioMode])

    // Studio FX Trigger
    useEffect(() => {
      if (isPlaying || isStudioMode) {
        initAudioGraph()
      }
    }, [isPlaying, isStudioMode, initAudioGraph])

    // Main Audio Setup Effect
    useEffect(() => {
      if (!audioUrl) return

      const audio = new Audio(audioUrl)
      audioRef.current = audio
      audio.crossOrigin = 'anonymous' // Enable Web Audio API

      // Initialize beat with SeamlessLooper for gapless playback
      let beatLooper: SeamlessLooper | null = null
      if (beatUrl) {
        beatLooper = new SeamlessLooper()
        beatLooper.setVolume(beatVolume)
        beatLooper.load(beatUrl).catch((err) => {
          console.error('Failed to load beat for seamless looping:', err)
        })
        beatLooperRef.current = beatLooper
      }

      const handleError = (e: Event) => {
        console.error('Audio playback error:', e)
        const target = e.target as HTMLAudioElement
        let message = 'Playback failed'
        if (target.error) {
          switch (target.error.code) {
            case target.error.MEDIA_ERR_ABORTED:
              message = 'Playback aborted'
              break
            case target.error.MEDIA_ERR_NETWORK:
              message = 'Network error - check connection'
              break
            case target.error.MEDIA_ERR_DECODE:
              message = 'Audio decoding failed - file may be corrupted'
              break
            case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              message = 'Audio format not supported or file not found'
              break
          }
        }
        setAudioError(message)
        setIsPlaying(false)
      }

      audio.addEventListener('error', handleError)
      audio.addEventListener('loadedmetadata', () => {
        if (Number.isFinite(audio.duration)) {
          setDuration(audio.duration)
        }
        setAudioError(null)
      })

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime)
        // NOTE: Removed beat sync drift correction - it was causing audio glitches
        // Beat sync is now only done on explicit seek actions (skip, waveform click)
      })

      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setCurrentTime(0)
        if (beatLooperRef.current) {
          beatLooperRef.current.stop()
        }
      })

      return () => {
        audio.removeEventListener('error', handleError)
        audio.pause()
        audio.src = ''
        if (beatLooperRef.current) {
          beatLooperRef.current.destroy()
          beatLooperRef.current = null
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioUrl, beatUrl]) // Removed nudge - handled via ref to avoid audio recreation

    const togglePlay = useCallback(() => {
      if (!audioRef.current) return

      if (isPlaying) {
        audioRef.current.pause()
        if (beatLooperRef.current) beatLooperRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        if (beatLooperRef.current) {
          // Sync beat to voice using the recorded offset
          // Voice starts at t=0, beat should start at beatOffsetMs/1000
          const beatStartTime =
            (beatOffsetMs || 0) / 1000 + audioRef.current.currentTime
          beatLooperRef.current.seek(beatStartTime)
          beatLooperRef.current.play()
        }
        setIsPlaying(true)
      }
    }, [isPlaying, beatOffsetMs])

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!audioRef.current) return
      const val = parseFloat(e.target.value)
      setVolume(val)
      audioRef.current.volume = val
      setIsMuted(val === 0)
    }

    const handleBeatVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value)
      setBeatVolume(val)
      if (beatLooperRef.current) {
        beatLooperRef.current.setVolume(val)
      }
    }

    const skipForward = () => {
      if (!audioRef.current) return
      const newTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + 10
      )
      audioRef.current.currentTime = newTime
      // Apply beat offset for sync
      if (beatLooperRef.current) {
        beatLooperRef.current.seek(newTime + (beatOffsetMs || 0) / 1000)
      }
    }

    const skipBackward = () => {
      if (!audioRef.current) return
      const newTime = Math.max(0, audioRef.current.currentTime - 10)
      audioRef.current.currentTime = newTime
      // Apply beat offset for sync
      if (beatLooperRef.current) {
        beatLooperRef.current.seek(newTime + (beatOffsetMs || 0) / 1000)
      }
    }

    const resetPlayback = useCallback(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        setCurrentTime(0)
      }
      if (beatLooperRef.current) {
        // Reset to the original offset position
        beatLooperRef.current.seek((beatOffsetMs || 0) / 1000)
      }
    }, [beatOffsetMs])

    // Keyboard Shortcuts - MOVED UP before early returns
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Ignore if typing in input
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
          return

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

      if (!audioUrl) return // Don't attach listeners if no audio? Or just check inside.
      // Actually safer to attach but just check in handler.
      // But clean view might also return early?
      // Let's check lines 281-321 - it returns early for Clean View too!

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [togglePlay, audioUrl, resetPlayback])

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
          'bg-black/80 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group/player',
          className
        )}
      >
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-accent-purple/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent-blue/5 rounded-full blur-[100px] pointer-events-none" />

        {/* 1. Unified Console Header */}
        <div className="relative px-6 py-5 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/2">
          {/* Track Info */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center border border-accent-purple/10 shadow-[0_0_15px_rgba(125,122,255,0.1)]">
              <Disc size={20} className="text-accent-purple" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base leading-tight">
                {beatTitle || 'Freestyle Session'}
              </h3>
              <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                <span className="font-mono text-accent-purple/80">
                  {beatBpm} BPM
                </span>
                {beatArtist && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>{beatArtist}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Session Metadata Badge */}
          <div className="flex items-center gap-3">
            {sessionDate && (
              <div className="text-xs text-text-tertiary font-mono">
                {formatRelativeTime(sessionDate)}
              </div>
            )}
          </div>
        </div>

        {/* 2. Main Stage */}
        <div className="p-8 pb-10 flex flex-col items-center gap-8 relative z-10">
          {audioError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/10 text-red-300 text-xs px-4 py-2 rounded-full border border-red-500/20 backdrop-blur-md">
              Error: {audioError}
            </div>
          )}

          {/* Big Time Display */}
          <div className="text-center">
            <div className="text-6xl md:text-7xl font-light font-numeral text-white/90 tracking-wider tabular-nums drop-shadow-xl">
              {formatDuration(Math.round(currentTime))}
            </div>
            <div className="text-sm font-medium text-text-tertiary tracking-[0.2em] mt-2 uppercase opacity-60">
              Total {formatDuration(Math.round(duration))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-8">
            <button
              onClick={skipBackward}
              className="group p-4 md:p-3 rounded-full hover:bg-white/5 transition-colors text-text-secondary hover:text-white"
            >
              <SkipBack
                size={24}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </button>

            <button
              onClick={togglePlay}
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95',
                'bg-black/40 border border-accent-purple/30 backdrop-blur-md shadow-[0_0_30px_rgba(125,122,255,0.15)]',
                'hover:border-accent-purple/60 hover:shadow-[0_0_40px_rgba(125,122,255,0.25)] hover:bg-accent-purple/10',
                isPlaying &&
                  'border-accent-purple bg-accent-purple/5 shadow-[0_0_50px_rgba(125,122,255,0.3)]'
              )}
            >
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
                  isPlaying
                    ? 'bg-accent-purple shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)]'
                    : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-110'
                )}
              >
                {isPlaying ? (
                  <Pause size={28} className="text-white fill-white" />
                ) : (
                  <Play size={32} className="ml-1 fill-black" />
                )}
              </div>
            </button>

            <button
              onClick={skipForward}
              className="group p-4 md:p-3 rounded-full hover:bg-white/5 transition-colors text-text-secondary hover:text-white"
            >
              <SkipForward
                size={24}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>

          {/* Waveform */}
          <div className="w-full max-w-2xl px-4">
            <div className="bg-black/20 rounded-xl p-1 border border-white/5">
              <WaveformScrubber
                url={audioUrl}
                progress={duration > 0 ? currentTime / duration : 0}
                onChange={(time) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = time
                    // Apply beat offset for sync
                    if (beatLooperRef.current) {
                      beatLooperRef.current.seek(
                        time + (beatOffsetMs || 0) / 1000
                      )
                    }
                    setCurrentTime(time)
                  }
                }}
                onSeek={(time) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = time
                    // Apply beat offset for sync
                    if (beatLooperRef.current) {
                      beatLooperRef.current.seek(
                        time + (beatOffsetMs || 0) / 1000
                      )
                    }
                    setCurrentTime(time)
                  }
                }}
                height={64}
              />
            </div>
          </div>
        </div>

        {/* 3. Mixing Console Deck */}
        <div className="bg-[#0A0A0C]/90 backdrop-blur-md border-t border-white/5 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
            {/* Left: Mixer Levels */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 size={14} className="text-accent-purple" />
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                  Mixer Levels
                </span>
              </div>

              {/* Vocal Slider */}
              <div className="space-y-2 group">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-white group-hover:text-accent-purple transition-colors">
                    Vocals
                  </span>
                  <span className="font-mono text-text-tertiary">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-accent-purple transition-colors"
                />
              </div>

              {/* Beat Slider */}
              {beatUrl && (
                <div className="space-y-2 group">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white group-hover:text-accent-blue transition-colors">
                      Beat
                    </span>
                    <span className="font-mono text-text-tertiary">
                      {Math.round(beatVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={beatVolume}
                    onChange={handleBeatVolumeChange}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-text-secondary hover:accent-accent-blue transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Right: Studio Tools (Always visible in Console) */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-accent-blue" />
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                  Studio Processing
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* FX Toggle Button */}
                <button
                  onClick={() => setIsStudioMode(!isStudioMode)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300',
                    isStudioMode
                      ? 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue shadow-[0_0_15px_rgba(10,132,255,0.15)]'
                      : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Sparkles size={20} />
                  <span className="text-xs font-medium">Reverb & EQ</span>
                  <span
                    className={cn(
                      'text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm',
                      isStudioMode
                        ? 'bg-accent-blue text-black'
                        : 'bg-white/10 text-text-tertiary'
                    )}
                  >
                    {isStudioMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* Vocal Align Control */}
                <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-medium text-text-secondary uppercase">
                      Alignment
                    </span>
                    <span className="text-[10px] font-mono text-accent-pink">
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
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-pink/80 hover:accent-accent-pink"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

SessionPlayer.displayName = 'SessionPlayer'

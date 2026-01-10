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
  VolumeX,
  SkipBack,
  SkipForward,
  Sparkles,
  Clock,
  RefreshCcw,
  Disc,
  Activity,
  Calendar,
  BarChart,
} from 'lucide-react'
import { formatDuration, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

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
  className?: string
  // Metadata props for integrated display
  beatTitle?: string
  beatBpm?: number
  beatArtist?: string
  sessionDuration?: number
  sessionDifficulty?: number
  sessionDate?: string | Date
}

export const SessionPlayer = forwardRef<
  SessionPlayerHandles,
  SessionPlayerProps
>(
  (
    {
      audioUrl,
      beatUrl,
      className,
      beatTitle,
      beatBpm,
      beatArtist,
      sessionDuration,
      sessionDifficulty,
      sessionDate,
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [volume, setVolume] = useState(1)
    const [beatVolume, setBeatVolume] = useState(0.8)
    const [isMuted, setIsMuted] = useState(false)
    const [audioError, setAudioError] = useState<string | null>(null)

    // Advanced Features
    const [nudge, setNudge] = useState(0)
    const [isStudioMode, setIsStudioMode] = useState(true)
    const [showAdvanced, setShowAdvanced] = useState(false)

    // Expose settings to parent (e.g. for downloading mix)
    useImperativeHandle(ref, () => ({
      getSettings: () => ({
        voiceVolume: isMuted ? 0 : volume,
        beatVolume,
        isStudioMode,
      }),
    }))

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
        setNudge(parseInt(saved))
      }
    }, [])

    // dedicated effect for beat volume
    useEffect(() => {
      if (beatRef.current) {
        beatRef.current.volume = beatVolume
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

      // Initialize beat audio if URL provided
      if (beatUrl) {
        const beat = new Audio(beatUrl)
        beat.volume = beatVolume
        beat.loop = true // Loop beat to match recording if session was longer than beat duration
        beatRef.current = beat
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
        setDuration(audio.duration)
        setAudioError(null)
      })

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime)
        // Sync beat audio only if drift is significant (> 300ms)
        // Lower thresholds cause stuttering due to constant seeking
        if (beatRef.current) {
          const targetTime = audio.currentTime - nudge / 1000
          const drift = Math.abs(beatRef.current.currentTime - targetTime)
          // Only sync if drift exceeds 0.3s to avoid stuttering
          if (drift > 0.3 && targetTime >= 0) {
            beatRef.current.currentTime = targetTime
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
        audio.removeEventListener('error', handleError)
        audio.pause()
        audio.src = ''
        if (beatRef.current) {
          beatRef.current.pause()
          beatRef.current.src = ''
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioUrl, beatUrl, nudge])

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
      const newTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + 10
      )
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
    }, [togglePlay, audioUrl])

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
          'bg-background-elevated rounded-2xl p-4 md:p-8 border border-white/5 shadow-2xl relative',
          className
        )}
      >
        {/* Error Message */}
        {audioError && (
          <div className="mb-4 bg-red-500/20 text-red-200 text-xs px-3 py-2 rounded-lg border border-red-500/50 flex items-center gap-2">
            <span>⚠️ {audioError}</span>
          </div>
        )}

        {/* Compact Metadata Pills */}
        {(beatTitle || sessionDuration) && (
          <div className="flex gap-2 mb-4">
            {/* Beat Info Pill */}
            {beatTitle && (
              <div className="flex-1 bg-background-card/50 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Disc size={14} className="text-accent-purple" />
                  <span className="text-xs font-medium text-white truncate">
                    {beatTitle}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-text-tertiary">
                  {beatBpm && <span>{beatBpm} BPM</span>}
                  {beatArtist && <span className="truncate">{beatArtist}</span>}
                </div>
              </div>
            )}

            {/* Session Stats Pill */}
            {sessionDuration !== undefined && (
              <div className="flex-1 bg-background-card/50 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={14} className="text-accent-purple" />
                  <span className="text-xs font-medium text-white">
                    {formatDuration(sessionDuration)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-text-tertiary">
                  {sessionDifficulty && (
                    <span
                      className={`flex items-center gap-1 ${
                        sessionDifficulty === 1
                          ? 'text-accent-green'
                          : sessionDifficulty === 2
                            ? 'text-accent-orange'
                            : 'text-accent-red'
                      }`}
                    >
                      <BarChart size={10} />
                      {['Easy', 'Medium', 'Hard'][sessionDifficulty - 1]}
                    </span>
                  )}
                  {sessionDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {formatRelativeTime(sessionDate)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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
            <span className="text-xs text-text-secondary uppercase tracking-wider w-16">
              Vocals
            </span>
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={toggleMute}
                className="text-text-secondary hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
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
              <span className="text-xs text-text-secondary uppercase tracking-wider w-16">
                Beat
              </span>
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
                    <div className="text-sm text-white font-medium">
                      Studio FX
                    </div>
                    <div className="text-xs text-text-tertiary">
                      Add Reverb & Polish
                    </div>
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
)

SessionPlayer.displayName = 'SessionPlayer'

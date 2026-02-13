import { BeatPlaybackState } from '@/lib/beats/types'

/**
 * Audio Player utility class for managing beat playback
 */
export class AudioPlayer {
  private audio: HTMLAudioElement | null = null
  private onTimeUpdateCallback: ((time: number) => void) | null = null
  private onEndedCallback: (() => void) | null = null
  private debug: boolean = false
  private isDestroyed: boolean = false
  private loopEnabled: boolean = false
  private loopStartSeconds: number = 0

  constructor() {
    // Debug logs are opt-in and disabled in production for privacy.
    this.debug =
      process.env.NODE_ENV !== 'production' &&
      process.env.NEXT_PUBLIC_AUDIO_DEBUG === 'true'

    if (typeof window !== 'undefined') {
      this.audio = new Audio()
      this.audio.crossOrigin = 'anonymous' // Required for Web Audio API Bridge
      this.setupEventListeners()
    }
  }

  private sanitizeUrlForLog(url: string) {
    try {
      const parsed = new URL(url)
      const filename = parsed.pathname.split('/').filter(Boolean).pop() || ''
      return `${parsed.protocol}//${parsed.host}/.../${filename}`
    } catch {
      // Not a valid URL (or already a safe local path)
      return url
    }
  }

  private log(message: string, ...args: unknown[]) {
    if (this.debug && !this.isDestroyed)
      console.log(`[AudioPlayer] ${message}`, ...args)
  }

  private setupEventListeners() {
    if (!this.audio) return

    this.audio.addEventListener('timeupdate', () => {
      if (this.isDestroyed) return
      if (this.onTimeUpdateCallback && this.audio) {
        this.onTimeUpdateCallback(this.audio.currentTime)
      }

      // If a calibrated cue/start point exists, keep loops anchored there.
      if (
        this.audio &&
        this.loopEnabled &&
        this.loopStartSeconds > 0 &&
        Number.isFinite(this.audio.duration) &&
        this.audio.duration > 0
      ) {
        const loopBoundary = Math.max(
          this.loopStartSeconds,
          this.audio.duration - 0.05
        )
        if (this.audio.currentTime >= loopBoundary) {
          this.audio.currentTime = this.loopStartSeconds
        }
      }
    })

    this.audio.addEventListener('ended', () => {
      // For calibrated tracks we loop manually from loopStartSeconds.
      if (this.audio && this.loopEnabled && this.loopStartSeconds > 0) {
        this.audio.currentTime = this.loopStartSeconds
        void this.audio.play().catch(() => undefined)
        return
      }

      // Browser handles default loop naturally if .loop is true.
      if (this.audio?.loop && this.loopEnabled) {
        return
      }
      this.log('Playback ended')
      if (this.onEndedCallback) {
        this.onEndedCallback()
      }
    })

    // Handle buffering/loading issues
    this.audio.addEventListener('waiting', () => {
      this.log('Buffering...')
    })

    this.audio.addEventListener('stalled', () => {
      console.warn('[AudioPlayer] Playback stalled')
    })

    this.audio.addEventListener('error', (e) => {
      if (this.isDestroyed) return
      console.error('[AudioPlayer] HTMLAudioElement Error:', e)
      const error = this.audio?.error
      if (error) {
        console.error('[AudioPlayer] MediaError:', error.code, error.message)
      }
    })

    this.audio.addEventListener('play', () => this.log('Event: play'))
    this.audio.addEventListener('pause', () => this.log('Event: pause'))
  }

  /**
   * Load a new audio source
   */
  async load(url: string): Promise<void> {
    if (!this.audio) throw new Error('Audio not initialized')

    this.log('Loading beat:', this.sanitizeUrlForLog(url))

    // Stop current playback before loading new
    this.audio.pause()
    this.audio.currentTime = 0

    return new Promise((resolve, reject) => {
      if (!this.audio) return reject(new Error('Audio not initialized'))

      // Setup temporary load handlers
      const handleCanPlayThrough = () => {
        this.log('Asset loaded and ready to play')
        cleanup()
        resolve()
      }

      const handleError = (e: ErrorEvent | Event) => {
        if (this.isDestroyed) {
          cleanup()
          return
        }
        console.error('[AudioPlayer] Load failed', e)
        cleanup()
        reject(
          new Error(
            'Failed to load audio: ' +
              (e instanceof ErrorEvent ? e.message : 'Network error')
          )
        )
      }

      const cleanup = () => {
        this.audio?.removeEventListener('canplaythrough', handleCanPlayThrough)
        this.audio?.removeEventListener('error', handleError)
      }

      this.audio.addEventListener('canplaythrough', handleCanPlayThrough)
      this.audio.addEventListener('error', handleError)

      this.audio.src = url // Do not encodeURI - URLs from storage are already encoded
      this.audio.load()
    })
  }

  /**
   * Play the audio
   */
  async play(): Promise<void> {
    if (!this.audio) throw new Error('Audio not initialized')
    this.log('Play requested')
    try {
      await this.audio.play()
      this.log('Play started successfully')
    } catch (err) {
      console.error('[AudioPlayer] Play failed', err)
      throw err
    }
  }

  /**
   * Prime the audio element to unlock autoplay restrictions
   */
  async prime(): Promise<void> {
    if (!this.audio) return
    this.log('Priming audio')
    const originalVolume = this.audio.volume
    this.audio.volume = 0
    try {
      await this.audio.play()
      this.audio.pause()
      this.audio.currentTime = 0
      this.log('Audio primed')
    } catch (e) {
      console.warn('[AudioPlayer] Prime failed', e)
    } finally {
      this.audio.volume = originalVolume
    }
  }

  /**
   * Pause the audio
   */
  pause(): void {
    if (this.isDestroyed || !this.audio) {
      return // Fail silently
    }
    this.log('Pause requested')
    if (this.audio) {
      this.audio.pause()
    }
  }

  /**
   * Stop the audio and reset to beginning
   */
  stop(): void {
    if (this.isDestroyed || !this.audio) {
      // Fail silently if already destroyed (prevents navigation race conditions)
      return
    }
    this.log('Stop requested')

    // Defensive check again for strict safety
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
  }

  /**
   * Seek to a specific time
   */
  seek(time: number): void {
    if (!this.audio) throw new Error('Audio not initialized')
    this.audio.currentTime = time
  }

  /**
   * Set volume (0 to 1)
   */
  setVolume(volume: number): void {
    if (!this.audio) throw new Error('Audio not initialized')
    this.audio.volume = Math.max(0, Math.min(1, volume))
  }

  /**
   * Get current playback state
   */
  getState(): BeatPlaybackState {
    if (!this.audio) {
      return {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
      }
    }

    return {
      isPlaying: !this.audio.paused,
      currentTime: this.audio.currentTime,
      duration: this.audio.duration || 0,
      volume: this.audio.volume,
    }
  }

  /**
   * Set callback for time updates
   */
  onTimeUpdate(callback: (time: number) => void): void {
    this.onTimeUpdateCallback = callback
  }

  /**
   * Set callback for when audio ends
   */
  onEnded(callback: () => void): void {
    this.onEndedCallback = callback
  }

  /**
   * Enable looping
   */
  setLoop(loop: boolean): void {
    if (!this.audio) throw new Error('Audio not initialized')
    this.loopEnabled = loop
    this.audio.loop = loop && this.loopStartSeconds <= 0
  }

  /**
   * Set calibrated loop start (seconds). 0 means full-track looping.
   */
  setLoopStart(seconds: number): void {
    if (!this.audio) throw new Error('Audio not initialized')

    const normalized =
      Number.isFinite(seconds) && seconds > 0 ? Number(seconds) : 0
    this.loopStartSeconds = normalized

    // Native loop only works for full-track looping from 0.
    this.audio.loop = this.loopEnabled && this.loopStartSeconds <= 0
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.isDestroyed = true
    this.log('Destroying player instance')
    if (this.audio) {
      try {
        if (this.audio._sourceNode) {
          try {
            this.audio._sourceNode.disconnect()
          } catch {
            // ignore disconnect errors during cleanup
          }
          this.audio._sourceNode = undefined
        }

        this.audio.pause()
        this.audio.src = ''
        this.audio.load() // help browser release resources
      } catch (e) {
        // ignore errors during cleanup
      }
      this.audio = null
    }
    this.onTimeUpdateCallback = null
    this.onEndedCallback = null
  }

  /**
   * Connects the audio element to a Web Audio API Context.
   * This bridges the HTMLAudioElement into the audio graph, allowing
   * synchronization with the AudioContext clock and visualizers.
   */
  connectToContext(context: AudioContext): void {
    if (!this.audio) return

    try {
      if (this.audio._sourceNode) return

      const source = context.createMediaElementSource(this.audio)
      source.connect(context.destination)

      this.audio._sourceNode = source

      this.log('Connected to AudioContext')
    } catch (e) {
      console.warn('[AudioPlayer] Connection to context failed:', e)
    }
  }
}

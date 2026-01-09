import { BeatPlaybackState } from '@/lib/beats/types'

/**
 * Audio Player utility class for managing beat playback
 */
export class AudioPlayer {
  private audio: HTMLAudioElement | null = null
  private onTimeUpdateCallback: ((time: number) => void) | null = null
  private onEndedCallback: (() => void) | null = null
  private debug: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio()
      // this.audio.crossOrigin = 'anonymous' // Removed to prevents CORS errors with local/external assets
      this.setupEventListeners()
    }
  }

  private log(message: string, ...args: unknown[]) {
    if (this.debug) console.log(`[AudioPlayer] ${message}`, ...args)
  }

  private setupEventListeners() {
    if (!this.audio) return

    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback && this.audio) {
        this.onTimeUpdateCallback(this.audio.currentTime)
      }
    })

    this.audio.addEventListener('ended', () => {
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

    this.log('Loading beat:', url)

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
    if (!this.audio) throw new Error('Audio not initialized')
    this.log('Pause requested')
    this.audio.pause()
  }

  /**
   * Stop the audio and reset to beginning
   */
  stop(): void {
    if (!this.audio) throw new Error('Audio not initialized')
    this.log('Stop requested')
    this.audio.pause()
    this.audio.currentTime = 0
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
    this.audio.loop = loop
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.log('Destroying player instance')
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
      this.audio = null
    }
    this.onTimeUpdateCallback = null
    this.onEndedCallback = null
  }
}

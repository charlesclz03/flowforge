import { BeatPlaybackState } from '@/lib/beats/types'

/**
 * Audio Player utility class for managing beat playback
 */
export class AudioPlayer {
  private audio: HTMLAudioElement | null = null
  private onTimeUpdateCallback: ((time: number) => void) | null = null
  private onEndedCallback: (() => void) | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio()
      this.setupEventListeners()
    }
  }

  private setupEventListeners() {
    if (!this.audio) return

    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback && this.audio) {
        this.onTimeUpdateCallback(this.audio.currentTime)
      }
    })

    this.audio.addEventListener('ended', () => {
      if (this.onEndedCallback) {
        this.onEndedCallback()
      }
    })
  }

  /**
   * Load a new audio source
   */
  async load(url: string): Promise<void> {
    if (!this.audio) throw new Error('Audio not initialized')

    return new Promise((resolve, reject) => {
      if (!this.audio) return reject(new Error('Audio not initialized'))

      // Encode the URL to handle spaces and special characters while keeping protocol separators intact
      const encodedUrl = encodeURI(url)
      this.audio.src = encodedUrl
      this.audio.load()

      this.audio.onloadeddata = () => resolve()
      this.audio.onerror = () => reject(new Error('Failed to load audio'))
    })
  }

  /**
   * Play the audio
   */
  async play(): Promise<void> {
    if (!this.audio) throw new Error('Audio not initialized')
    await this.audio.play()
  }

  /**
   * Pause the audio
   */
  pause(): void {
    if (!this.audio) throw new Error('Audio not initialized')
    this.audio.pause()
  }

  /**
   * Stop the audio and reset to beginning
   */
  stop(): void {
    if (!this.audio) throw new Error('Audio not initialized')
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
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
      this.audio = null
    }
    this.onTimeUpdateCallback = null
    this.onEndedCallback = null
  }
}

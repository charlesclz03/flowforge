import { BeatPlaybackState } from '@/lib/beats/types'
import { SeamlessLooper } from '@/lib/audio/seamless-looper'

/**
 * AudioPlayer keeps the historical practice-player API stable while using the
 * Web Audio looper that review playback already depends on for gapless beats.
 */
export class AudioPlayer {
  private looper: SeamlessLooper | null = null
  private onTimeUpdateCallback: ((time: number) => void) | null = null
  private onEndedCallback: (() => void) | null = null
  private debug = false
  private isDestroyed = false
  private timeUpdateFrame: number | null = null

  constructor() {
    this.debug =
      process.env.NODE_ENV !== 'production' &&
      process.env.NEXT_PUBLIC_AUDIO_DEBUG === 'true'

    if (typeof window !== 'undefined') {
      this.looper = new SeamlessLooper(this.debug)
      this.looper.onEnded(() => {
        this.stopTimeUpdates()
        this.onEndedCallback?.()
      })
    }
  }

  private sanitizeUrlForLog(url: string) {
    try {
      const parsed = new URL(url)
      const filename = parsed.pathname.split('/').filter(Boolean).pop() || ''
      return `${parsed.protocol}//${parsed.host}/.../${filename}`
    } catch {
      return url
    }
  }

  private log(message: string, ...args: unknown[]) {
    if (this.debug && !this.isDestroyed) {
      console.log(`[AudioPlayer] ${message}`, ...args)
    }
  }

  private requireLooper() {
    if (!this.looper) throw new Error('Audio not initialized')
    return this.looper
  }

  private startTimeUpdates() {
    if (this.timeUpdateFrame !== null || typeof window === 'undefined') return

    const tick = () => {
      if (this.isDestroyed || !this.looper?.getIsPlaying()) {
        this.timeUpdateFrame = null
        return
      }

      this.onTimeUpdateCallback?.(this.looper.getCurrentTime())
      this.timeUpdateFrame = window.requestAnimationFrame(tick)
    }

    this.timeUpdateFrame = window.requestAnimationFrame(tick)
  }

  private stopTimeUpdates() {
    if (this.timeUpdateFrame !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.timeUpdateFrame)
    }
    this.timeUpdateFrame = null
  }

  async load(url: string): Promise<void> {
    const looper = this.requireLooper()
    this.log('Loading beat:', this.sanitizeUrlForLog(url))
    looper.stop()
    await looper.load(url)
    this.onTimeUpdateCallback?.(looper.getCurrentTime())
  }

  async play(): Promise<void> {
    const looper = this.requireLooper()
    this.log('Play requested')
    await looper.play()
    if (!looper.getIsPlaying()) {
      throw new Error('Playback did not start')
    }
    this.startTimeUpdates()
    this.log('Play started successfully')
  }

  async prime(): Promise<void> {
    await this.looper?.prime()
  }

  pause(): void {
    if (this.isDestroyed || !this.looper) return
    this.log('Pause requested')
    this.looper.pause()
    this.stopTimeUpdates()
    this.onTimeUpdateCallback?.(this.looper.getCurrentTime())
  }

  stop(): void {
    if (this.isDestroyed || !this.looper) return
    this.log('Stop requested')
    this.looper.stop()
    this.stopTimeUpdates()
    this.onTimeUpdateCallback?.(0)
  }

  seek(time: number): void {
    const looper = this.requireLooper()
    looper.seek(time)
    this.onTimeUpdateCallback?.(looper.getCurrentTime())
    if (looper.getIsPlaying()) {
      this.startTimeUpdates()
    }
  }

  setVolume(volume: number): void {
    this.requireLooper().setVolume(volume)
  }

  getState(): BeatPlaybackState {
    if (!this.looper) {
      return {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
      }
    }

    const state = this.looper.getState()
    return {
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
      duration: state.duration,
      volume: state.volume,
    }
  }

  onTimeUpdate(callback: (time: number) => void): void {
    this.onTimeUpdateCallback = callback
  }

  onEnded(callback: () => void): void {
    this.onEndedCallback = callback
  }

  setLoop(loop: boolean): void {
    this.requireLooper().setLoop(loop)
  }

  setLoopStart(seconds: number): void {
    this.requireLooper().setLoopStart(seconds)
  }

  destroy(): void {
    this.isDestroyed = true
    this.stopTimeUpdates()
    this.looper?.destroy()
    this.looper = null
    this.onTimeUpdateCallback = null
    this.onEndedCallback = null
  }

  connectToContext(context: AudioContext): void {
    this.looper?.setAudioContext(context)
    this.log('Connected to AudioContext')
  }
}

/**
 * SeamlessLooper - Provides gapless audio looping using Web Audio API
 *
 * The native HTML Audio loop attribute causes a small gap when looping because
 * the browser has to re-decode from the beginning. This class uses AudioBufferSourceNode
 * with double-buffering to achieve truly seamless loops.
 */
export class SeamlessLooper {
  private audioContext: AudioContext | null = null
  private audioBuffer: AudioBuffer | null = null
  private gainNode: GainNode | null = null
  private currentSource: AudioBufferSourceNode | null = null
  private nextSource: AudioBufferSourceNode | null = null

  private isPlaying: boolean = false
  private startTime: number = 0 // Context time when playback started
  private pauseOffset: number = 0 // Position in the track when paused
  private volume: number = 0.8

  private debug: boolean = false
  private isDestroyed: boolean = false

  constructor(debug: boolean = false) {
    this.debug = debug
  }

  private log(message: string, ...args: unknown[]) {
    if (this.debug && !this.isDestroyed) {
      console.log(`[SeamlessLooper] ${message}`, ...args)
    }
  }

  /**
   * Initialize the audio context and decode the audio file
   */
  async load(url: string): Promise<void> {
    this.log('Loading audio:', url)

    // Create audio context if not exists
    if (!this.audioContext) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      this.audioContext = new AudioContextClass()
    }

    // Resume if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    // Create gain node for volume control
    if (!this.gainNode) {
      this.gainNode = this.audioContext.createGain()
      this.gainNode.connect(this.audioContext.destination)
      this.gainNode.gain.value = this.volume
    }

    // Fetch and decode audio
    try {
      const response = await fetch(url)
      if (!response.ok)
        throw new Error(`Failed to fetch audio: ${response.status}`)

      const arrayBuffer = await response.arrayBuffer()
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)

      this.log('Audio loaded, duration:', this.audioBuffer.duration, 'seconds')
    } catch (err) {
      console.error('[SeamlessLooper] Failed to load audio:', err)
      throw err
    }
  }

  /**
   * Create a new source node from the buffer
   */
  private createSource(): AudioBufferSourceNode | null {
    if (!this.audioContext || !this.audioBuffer || !this.gainNode) return null

    const source = this.audioContext.createBufferSource()
    source.buffer = this.audioBuffer
    source.connect(this.gainNode)

    return source
  }

  /**
   * Schedule the next loop iteration
   * This is the key to seamless looping - we schedule the next source to start
   * exactly when the current one ends
   */
  private scheduleNextLoop(startAt: number): void {
    if (
      !this.audioContext ||
      !this.audioBuffer ||
      !this.isPlaying ||
      this.isDestroyed
    ) {
      return
    }

    this.nextSource = this.createSource()
    if (!this.nextSource) return

    // Schedule to start exactly when current ends
    this.nextSource.start(startAt)

    // When this source ends, schedule the next one
    this.nextSource.onended = () => {
      if (this.isPlaying && !this.isDestroyed) {
        // Rotate: next becomes current
        this.currentSource = this.nextSource
        this.nextSource = null

        // Schedule the next iteration
        const nextStartTime = startAt + this.audioBuffer!.duration
        this.scheduleNextLoop(nextStartTime)
      }
    }

    this.log('Scheduled next loop at:', startAt.toFixed(3))
  }

  /**
   * Start or resume playback
   */
  play(): void {
    if (
      !this.audioContext ||
      !this.audioBuffer ||
      this.isPlaying ||
      this.isDestroyed
    ) {
      return
    }

    // Resume context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    this.isPlaying = true

    // Create and start the first source
    this.currentSource = this.createSource()
    if (!this.currentSource) return

    const now = this.audioContext.currentTime

    // If we're resuming, start from the paused position
    const offset = this.pauseOffset % this.audioBuffer.duration
    this.startTime = now - offset

    this.currentSource.start(now, offset)

    // Calculate when this playback will end and schedule next loop
    const remainingDuration = this.audioBuffer.duration - offset
    const nextLoopTime = now + remainingDuration

    this.currentSource.onended = () => {
      if (this.isPlaying && !this.isDestroyed) {
        this.currentSource = this.nextSource
        this.nextSource = null

        const nextStartTime = nextLoopTime + this.audioBuffer!.duration
        this.scheduleNextLoop(nextStartTime)
      }
    }

    // Pre-schedule the next loop
    this.scheduleNextLoop(nextLoopTime)

    this.log('Started playback, offset:', offset.toFixed(3))
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this.audioContext || !this.isPlaying) return

    this.isPlaying = false

    // Calculate current position
    const now = this.audioContext.currentTime
    const elapsed = now - this.startTime
    this.pauseOffset = elapsed % (this.audioBuffer?.duration || 1)

    // Stop sources
    this.stopSources()

    this.log('Paused at:', this.pauseOffset.toFixed(3))
  }

  /**
   * Stop playback and reset to beginning
   */
  stop(): void {
    this.pause()
    this.pauseOffset = 0
    this.log('Stopped')
  }

  /**
   * Stop all active sources
   */
  private stopSources(): void {
    try {
      if (this.currentSource) {
        this.currentSource.onended = null
        this.currentSource.stop()
        this.currentSource.disconnect()
        this.currentSource = null
      }
    } catch (e) {
      // Ignore - source may already be stopped
    }

    try {
      if (this.nextSource) {
        this.nextSource.onended = null
        this.nextSource.stop()
        this.nextSource.disconnect()
        this.nextSource = null
      }
    } catch (e) {
      // Ignore - source may already be stopped
    }
  }

  /**
   * Seek to a specific time position
   */
  seek(time: number): void {
    if (!this.audioBuffer) return

    const wasPlaying = this.isPlaying

    // Stop current playback
    if (wasPlaying) {
      this.isPlaying = false
      this.stopSources()
    }

    // Set new position
    this.pauseOffset = time % this.audioBuffer.duration

    // Resume if was playing
    if (wasPlaying) {
      // Small delay to allow sources to clean up
      setTimeout(() => this.play(), 10)
    }

    this.log('Seeked to:', this.pauseOffset.toFixed(3))
  }

  /**
   * Set volume (0 to 1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(
        this.volume,
        this.audioContext?.currentTime || 0
      )
    }
  }

  /**
   * Get current playback position within the loop
   */
  getCurrentTime(): number {
    if (!this.audioContext || !this.audioBuffer || !this.isPlaying) {
      return this.pauseOffset
    }

    const elapsed = this.audioContext.currentTime - this.startTime
    return elapsed % this.audioBuffer.duration
  }

  /**
   * Get total duration of the audio
   */
  getDuration(): number {
    return this.audioBuffer?.duration || 0
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * Clean up all resources
   */
  destroy(): void {
    this.isDestroyed = true
    this.isPlaying = false
    this.log('Destroying looper')

    this.stopSources()

    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }

    if (this.audioContext) {
      this.audioContext.close().catch(() => {})
      this.audioContext = null
    }

    this.audioBuffer = null
  }
}

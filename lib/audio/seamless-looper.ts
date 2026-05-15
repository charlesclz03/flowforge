/**
 * SeamlessLooper - gapless beat playback using the Web Audio API.
 *
 * The browser-native HTMLAudioElement loop flag can introduce an audible gap at
 * the boundary. This class decodes the beat once, then schedules the next
 * AudioBufferSourceNode before the current source finishes.
 */

export interface SeamlessLooperState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  loopEnabled: boolean
  loopStartSeconds: number
  loopCount: number
}

const LOOP_SAFETY_MARGIN_SECONDS = 0.01
const SCHEDULE_AHEAD_MS = 200

export function normalizeLoopStart(
  startSeconds: number | null | undefined,
  durationSeconds: number
): number {
  if (!Number.isFinite(startSeconds ?? NaN)) return 0

  const parsed = Number(startSeconds)
  if (parsed <= 0) return 0

  if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
    return Math.min(
      parsed,
      Math.max(durationSeconds - LOOP_SAFETY_MARGIN_SECONDS, 0)
    )
  }

  return parsed
}

export function normalizeLoopPosition(
  timeSeconds: number,
  durationSeconds: number,
  loopStartSeconds = 0
): number {
  if (!Number.isFinite(timeSeconds)) return loopStartSeconds
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0

  const start = normalizeLoopStart(loopStartSeconds, durationSeconds)
  const segmentDuration = Math.max(durationSeconds - start, 0)
  if (segmentDuration <= LOOP_SAFETY_MARGIN_SECONDS) return start

  if (start > 0 && timeSeconds < start) return start

  const wrapped =
    (((timeSeconds - start) % segmentDuration) + segmentDuration) %
    segmentDuration

  return start + wrapped
}

export class SeamlessLooper {
  private audioContext: AudioContext | null = null
  private ownsAudioContext = false
  private audioBuffer: AudioBuffer | null = null
  private gainNode: GainNode | null = null
  private currentSource: AudioBufferSourceNode | null = null
  private nextSource: AudioBufferSourceNode | null = null
  private scheduleTimeoutId: ReturnType<typeof setTimeout> | null = null

  private isPlaying = false
  private playbackStartedAt = 0
  private playbackStartOffset = 0
  private pauseOffset = 0
  private volume = 0.8
  private loopEnabled = true
  private loopStartSeconds = 0
  private loopCount = 0
  private debug = false
  private isDestroyed = false
  private onEndedCallback: (() => void) | null = null
  private onLoopCallback: ((loopCount: number) => void) | null = null

  constructor(debug = false) {
    this.debug = debug
  }

  private log(message: string, ...args: unknown[]) {
    if (this.debug && !this.isDestroyed) {
      console.log(`[SeamlessLooper] ${message}`, ...args)
    }
  }

  private emitDebugEvent(
    type: 'play' | 'loop' | 'seek',
    detail: Record<string, number | boolean>
  ) {
    if (
      process.env.NODE_ENV === 'production' ||
      typeof window === 'undefined'
    ) {
      return
    }

    window.dispatchEvent(
      new CustomEvent('freestyla:audio-loop', {
        detail: {
          type,
          ...detail,
        },
      })
    )
  }

  private getAudioContextClass() {
    if (typeof window === 'undefined') {
      throw new Error('AudioContext is unavailable outside the browser')
    }

    const audioWindow = window as Window & {
      webkitAudioContext?: typeof AudioContext
    }
    const AudioContextClass =
      window.AudioContext || audioWindow.webkitAudioContext

    if (!AudioContextClass) {
      throw new Error('AudioContext is not supported in this browser')
    }

    return AudioContextClass
  }

  private async ensureAudioContext(resume = false): Promise<AudioContext> {
    if (!this.audioContext) {
      const AudioContextClass = this.getAudioContextClass()
      this.audioContext = new AudioContextClass()
      this.ownsAudioContext = true
    }

    const context = this.audioContext
    if (resume && context.state === 'suspended') {
      await context.resume()
    }

    this.ensureGainNode()
    return context
  }

  private ensureGainNode() {
    if (!this.audioContext || this.gainNode) return

    this.gainNode = this.audioContext.createGain()
    this.gainNode.gain.value = this.volume
    this.gainNode.connect(this.audioContext.destination)
  }

  setAudioContext(context: AudioContext): void {
    if (this.isDestroyed || this.audioContext === context) return

    if (this.isPlaying) {
      this.pause()
    }

    this.stopSources()

    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }

    if (this.audioContext && this.ownsAudioContext) {
      void this.audioContext.close().catch(() => {})
    }

    this.audioContext = context
    this.ownsAudioContext = false
    this.ensureGainNode()
  }

  async load(url: string): Promise<void> {
    this.log('Loading audio:', url)
    const context = await this.ensureAudioContext()

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      this.audioBuffer = await context.decodeAudioData(arrayBuffer)
      this.pauseOffset = normalizeLoopPosition(
        this.pauseOffset,
        this.audioBuffer.duration,
        this.loopStartSeconds
      )
      this.loopStartSeconds = normalizeLoopStart(
        this.loopStartSeconds,
        this.audioBuffer.duration
      )
      this.log('Audio loaded, duration:', this.audioBuffer.duration, 'seconds')
    } catch (err) {
      console.error('[SeamlessLooper] Failed to load audio:', err)
      throw err
    }
  }

  private createSource(): AudioBufferSourceNode | null {
    if (!this.audioContext || !this.audioBuffer || !this.gainNode) return null

    const source = this.audioContext.createBufferSource()
    source.buffer = this.audioBuffer
    source.connect(this.gainNode)
    source.onended = () => {
      source.disconnect()
    }

    return source
  }

  private getSegmentDuration(): number {
    if (!this.audioBuffer) return 0
    return Math.max(this.audioBuffer.duration - this.loopStartSeconds, 0)
  }

  private scheduleNextLoop(startAt: number): void {
    if (
      !this.audioContext ||
      !this.audioBuffer ||
      !this.isPlaying ||
      !this.loopEnabled ||
      this.isDestroyed
    ) {
      return
    }

    const context = this.audioContext
    const segmentDuration = this.getSegmentDuration()
    if (segmentDuration <= LOOP_SAFETY_MARGIN_SECONDS) return

    this.nextSource = this.createSource()
    if (!this.nextSource) return

    this.nextSource.start(startAt, this.loopStartSeconds)
    this.log('Scheduled next loop at:', startAt.toFixed(3))

    const nextStartTime = startAt + segmentDuration
    const msUntilNextSchedule =
      (nextStartTime - context.currentTime) * 1000 - SCHEDULE_AHEAD_MS

    if (this.scheduleTimeoutId) {
      clearTimeout(this.scheduleTimeoutId)
    }

    this.scheduleTimeoutId = setTimeout(
      () => {
        if (!this.isPlaying || this.isDestroyed) return

        this.loopCount += 1
        this.onLoopCallback?.(this.loopCount)
        this.emitDebugEvent('loop', {
          loopCount: this.loopCount,
          loopStartSeconds: this.loopStartSeconds,
          currentTime: this.loopStartSeconds,
          duration: this.audioBuffer?.duration || 0,
        })
        this.currentSource = this.nextSource
        this.nextSource = null
        this.scheduleNextLoop(nextStartTime)
      },
      Math.max(0, msUntilNextSchedule)
    )
  }

  async play(): Promise<void> {
    if (!this.audioBuffer || this.isPlaying || this.isDestroyed) return

    const context = await this.ensureAudioContext(true)
    this.isPlaying = true

    this.currentSource = this.createSource()
    if (!this.currentSource) {
      this.isPlaying = false
      return
    }

    const now = context.currentTime
    const offset = normalizeLoopPosition(
      this.pauseOffset,
      this.audioBuffer.duration,
      this.loopEnabled ? this.loopStartSeconds : 0
    )

    this.playbackStartedAt = now
    this.playbackStartOffset = offset
    this.pauseOffset = offset

    if (!this.loopEnabled) {
      this.currentSource.onended = () => {
        if (!this.isPlaying) return
        this.isPlaying = false
        this.pauseOffset = 0
        this.onEndedCallback?.()
      }
    }

    this.currentSource.start(now, offset)
    this.emitDebugEvent('play', {
      currentTime: offset,
      loopStartSeconds: this.loopStartSeconds,
      duration: this.audioBuffer.duration,
      loopEnabled: this.loopEnabled,
    })

    if (this.loopEnabled) {
      const remainingDuration = this.audioBuffer.duration - offset
      this.scheduleNextLoop(now + remainingDuration)
    }

    this.log('Started playback, offset:', offset.toFixed(3))
  }

  pause(): void {
    if (!this.audioContext || !this.isPlaying) return

    this.pauseOffset = this.getCurrentTime()
    this.isPlaying = false
    this.clearSchedule()
    this.stopSources()
    this.log('Paused at:', this.pauseOffset.toFixed(3))
  }

  stop(): void {
    if (this.isPlaying) {
      this.pause()
    } else {
      this.clearSchedule()
      this.stopSources()
    }

    this.pauseOffset = 0
    this.loopCount = 0
    this.log('Stopped')
  }

  private clearSchedule(): void {
    if (this.scheduleTimeoutId) {
      clearTimeout(this.scheduleTimeoutId)
      this.scheduleTimeoutId = null
    }
  }

  private stopSources(): void {
    try {
      if (this.currentSource) {
        this.currentSource.onended = null
        this.currentSource.stop()
        this.currentSource.disconnect()
        this.currentSource = null
      }
    } catch {
      // Source may have already ended.
    }

    try {
      if (this.nextSource) {
        this.nextSource.onended = null
        this.nextSource.stop()
        this.nextSource.disconnect()
        this.nextSource = null
      }
    } catch {
      // Source may have already ended.
    }
  }

  seek(time: number): void {
    if (!this.audioBuffer) return

    const wasPlaying = this.isPlaying
    if (wasPlaying) {
      this.isPlaying = false
      this.clearSchedule()
      this.stopSources()
    }

    this.pauseOffset = normalizeLoopPosition(
      time,
      this.audioBuffer.duration,
      this.loopEnabled ? this.loopStartSeconds : 0
    )

    if (wasPlaying) {
      void this.play()
    }

    this.emitDebugEvent('seek', {
      currentTime: this.pauseOffset,
      loopStartSeconds: this.loopStartSeconds,
      duration: this.audioBuffer.duration,
      loopEnabled: this.loopEnabled,
    })
    this.log('Seeked to:', this.pauseOffset.toFixed(3))
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setValueAtTime(
        this.volume,
        this.audioContext.currentTime
      )
    }
  }

  setLoop(loop: boolean): void {
    this.loopEnabled = loop
  }

  setLoopStart(seconds: number): void {
    this.loopStartSeconds = normalizeLoopStart(
      seconds,
      this.audioBuffer?.duration || 0
    )
    this.pauseOffset = normalizeLoopPosition(
      this.pauseOffset,
      this.audioBuffer?.duration || 0,
      this.loopEnabled ? this.loopStartSeconds : 0
    )
  }

  onEnded(callback: () => void): void {
    this.onEndedCallback = callback
  }

  onLoop(callback: (loopCount: number) => void): void {
    this.onLoopCallback = callback
  }

  getCurrentTime(): number {
    if (!this.audioContext || !this.audioBuffer || !this.isPlaying) {
      return this.pauseOffset
    }

    const elapsed = this.audioContext.currentTime - this.playbackStartedAt
    return normalizeLoopPosition(
      this.playbackStartOffset + elapsed,
      this.audioBuffer.duration,
      this.loopEnabled ? this.loopStartSeconds : 0
    )
  }

  getDuration(): number {
    return this.audioBuffer?.duration || 0
  }

  getIsPlaying(): boolean {
    return this.isPlaying
  }

  getState(): SeamlessLooperState {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.getCurrentTime(),
      duration: this.getDuration(),
      volume: this.volume,
      loopEnabled: this.loopEnabled,
      loopStartSeconds: this.loopStartSeconds,
      loopCount: this.loopCount,
    }
  }

  async prime(): Promise<void> {
    await this.ensureAudioContext(true)
  }

  destroy(): void {
    this.isDestroyed = true
    this.isPlaying = false
    this.clearSchedule()
    this.stopSources()

    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }

    if (this.audioContext && this.ownsAudioContext) {
      void this.audioContext.close().catch(() => {})
    }

    this.audioContext = null
    this.audioBuffer = null
    this.onEndedCallback = null
    this.onLoopCallback = null
  }
}

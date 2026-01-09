import { RECORDING_CONFIG } from '@/lib/constants/design'
import { WatermarkGenerator } from '@/lib/audio/watermark'

export interface RecorderConfig {
  mimeType?: string
  audioBitsPerSecond?: number
  maxDurationSeconds?: number
  shouldWatermark?: boolean
}

export interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  hasRecording: boolean
}

/**
 * AudioRecorder class for managing voice recording
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private startTime: number = 0
  private pausedTime: number = 0
  private maxDuration: number | null = null
  private maxDurationTimeout: ReturnType<typeof setTimeout> | null = null

  private audioContext: AudioContext | null = null
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null
  private mediaStreamDestination: MediaStreamAudioDestinationNode | null = null
  private watermarkGenerator: WatermarkGenerator | null = null

  private onDataAvailableCallback: ((blob: Blob) => void) | null = null
  private onStopCallback: ((blob: Blob) => void) | null = null
  private onErrorCallback: ((error: Error) => void) | null = null
  private onMaxDurationCallback: (() => void) | null = null

  /**
   * Initialize and get microphone permission
   */
  async initialize(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 2,
          sampleRate: RECORDING_CONFIG.SAMPLE_RATE,
        },
      })
    } catch (error) {
      throw new Error(`Failed to access microphone: ${error}`)
    }
  }

  /**
   * Start recording
   */
  async start(config?: RecorderConfig): Promise<void> {
    if (!this.stream) {
      await this.initialize()
    }

    if (!this.stream) {
      throw new Error('No audio stream available')
    }

    // Initialize Web Audio Context if needed
    if (!this.audioContext || this.audioContext.state === 'closed') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.audioContext = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )()
      this.watermarkGenerator = new WatermarkGenerator(this.audioContext)
    }

    // Resume AudioContext if suspended (browser policy)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    // Set up Audio Graph: Mic -> Destination
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(
      this.stream
    )
    this.mediaStreamDestination =
      this.audioContext.createMediaStreamDestination()
    this.mediaStreamSource.connect(this.mediaStreamDestination)

    const finalStream = this.mediaStreamDestination.stream

    this.audioChunks = []
    this.startTime = Date.now()
    this.maxDuration = config?.maxDurationSeconds || null

    // Play watermark if enabled
    if (config?.shouldWatermark && this.watermarkGenerator) {
      this.watermarkGenerator.play(this.mediaStreamDestination)
    }

    // Determine mime type
    const mimeType = this.getSupportedMimeType(config?.mimeType)

    this.mediaRecorder = new MediaRecorder(finalStream, {
      mimeType,
      audioBitsPerSecond: config?.audioBitsPerSecond || 128000,
    })

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data)

        if (this.onDataAvailableCallback) {
          this.onDataAvailableCallback(event.data)
        }
      }
    }

    this.mediaRecorder.onstop = () => {
      // Ensure we have at least one chunk
      if (this.audioChunks.length === 0) {
        // console.warn('No audio chunks collected, creating empty blob')
      }

      const blob = new Blob(this.audioChunks, { type: mimeType })

      if (this.onStopCallback) {
        this.onStopCallback(blob)
      } else {
        // console.warn('No onStop callback registered')
      }
    }

    this.mediaRecorder.onerror = (_event: Event) => {
      const error = new Error('MediaRecorder error')

      if (this.onErrorCallback) {
        this.onErrorCallback(error)
      }
    }

    this.mediaRecorder.start(100) // Collect data every 100ms

    // Auto-stop if max duration is set
    if (this.maxDuration) {
      if (this.maxDurationTimeout) {
        clearTimeout(this.maxDurationTimeout)
      }
      this.maxDurationTimeout = setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.stop()

          if (this.onMaxDurationCallback) {
            this.onMaxDurationCallback()
          }
        }
      }, this.maxDuration * 1000)
    }
  }

  /**
   * Stop recording
   */
  stop(): Blob | null {
    if (!this.mediaRecorder) {
      // console.warn('MediaRecorder not initialized, cannot stop')
      return null
    }

    if (this.mediaRecorder.state === 'inactive') {
      // console.warn('MediaRecorder already inactive, cannot stop')
      return null
    }

    // Stop the MediaRecorder - this will trigger onstop event
    this.mediaRecorder.stop()

    // Stop all tracks in the stream
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop()
        // console.log('Stopped track:', track.kind)
      })
      this.stream = null
    }

    // Close Audio Context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }

    if (this.maxDurationTimeout) {
      clearTimeout(this.maxDurationTimeout)
      this.maxDurationTimeout = null
    }

    return null // Blob will be available in onStop callback
  }

  /**
   * Pause recording
   */
  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause()
      this.pausedTime = Date.now()
    }
  }

  /**
   * Resume recording
   */
  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume()
      const pauseDuration = Date.now() - this.pausedTime
      this.startTime += pauseDuration
    }
  }

  /**
   * Get current recording duration in seconds
   */
  getDuration(): number {
    if (!this.startTime) return 0
    return (Date.now() - this.startTime) / 1000
  }

  /**
   * Get current state
   */
  getState(): RecordingState {
    return {
      isRecording: this.mediaRecorder?.state === 'recording',
      isPaused: this.mediaRecorder?.state === 'paused',
      duration: this.getDuration(),
      hasRecording: this.audioChunks.length > 0,
    }
  }

  /**
   * Get the active media stream
   */
  getStream(): MediaStream | null {
    return this.stream
  }

  /**
   * Get supported mime type
   */
  private getSupportedMimeType(preferred?: string): string {
    const types = [
      preferred,
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ].filter(Boolean) as string[]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'audio/webm' // Fallback
  }

  /**
   * Set callback for data available
   */
  onDataAvailable(callback: (blob: Blob) => void): void {
    this.onDataAvailableCallback = callback
  }

  /**
   * Set callback for stop
   */
  onStop(callback: (blob: Blob) => void): void {
    this.onStopCallback = callback
  }

  /**
   * Set callback for errors
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback
  }

  /**
   * Set callback for max duration reached
   */
  onMaxDuration(callback: () => void): void {
    this.onMaxDurationCallback = callback
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    this.mediaRecorder = null
    this.audioChunks = []
    this.onDataAvailableCallback = null
    this.onStopCallback = null
    this.onErrorCallback = null
    this.onMaxDurationCallback = null
  }
}

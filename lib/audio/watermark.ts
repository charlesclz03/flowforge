export class WatermarkGenerator {
  private context: AudioContext

  constructor(context: AudioContext) {
    this.context = context
  }

  /**
   * Plays the FreeStyla sonic brand (C Major 7th arpeggio)
   * used as an audio watermark for free tier recordings.
   */
  play(destination: AudioNode, time: number = 0) {
    const ctx = this.context
    const startTime = ctx.currentTime + time

    // Notes: C5, E5, G5, B5 (C Major 7)
    const notes = [523.25, 659.25, 783.99, 987.77]
    const duration = 0.1
    const gap = 0.05

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.value = freq

      // Smooth envelope
      const noteStart = startTime + index * (duration + gap)
      const noteEnd = noteStart + duration

      gain.gain.setValueAtTime(0, noteStart)
      gain.gain.linearRampToValueAtTime(0.1, noteStart + 0.02) // Increased volume slightly
      gain.gain.exponentialRampToValueAtTime(0.001, noteEnd)

      osc.connect(gain)
      gain.connect(destination)

      osc.start(noteStart)
      osc.stop(noteEnd + 0.1)
    })
  }

  /**
   * Loads an external audio file as watermark (Future V2)
   */
  async loadFromFile(url: string): Promise<AudioBuffer> {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return await this.context.decodeAudioData(arrayBuffer)
  }
}

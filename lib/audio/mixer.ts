// Impulse response for reverb (replicated from SessionPlayer for consistency)
const createReverb = (
  ctx: BaseAudioContext,
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

export interface MixOptions {
  voiceVolume: number
  beatVolume: number
  isStudioMode?: boolean
  reverbLevel?: number // 0 to 1
  nudge?: number // ms
  beatOffsetMs?: number // ms (beat position when recording started)
}

export class AudioMixer {
  private ctx: OfflineAudioContext | null = null

  async mix(
    voiceUrl: string,
    beatUrl: string | null, // Beat might be null (acapella export)
    options: MixOptions = {
      voiceVolume: 1.0,
      beatVolume: 0.8,
      isStudioMode: true,
    }
  ): Promise<Blob> {
    try {
      // SECURITY CHECK: Integrity Protection
      // prevent exporting silence or near-silence vocal to rip beats
      if (options.voiceVolume < 0.1) {
        throw new Error('Vocal volume too low. Integrity protection active.')
      }

      // 1. Fetch audio files
      const loadTasks = [this.fetchAndDecode(voiceUrl)]
      if (beatUrl)
        loadTasks.push(this.fetchAndDecode(beatUrl) as Promise<AudioBuffer>)

      const buffers = await Promise.all(loadTasks)
      const voiceBuffer = buffers[0]
      const beatBuffer = beatUrl ? buffers[1] : null

      // 2. Setup OfflineAudioContext
      // Duration is the VOICE duration (the actual recording length)
      // Beat will be looped if needed to fill the duration
      const duration = voiceBuffer.duration

      // Limit max duration to 10 minutes to prevent crash
      const safeDuration = Math.min(duration, 600)

      const sampleRate = 44100
      const length = safeDuration * sampleRate

      this.ctx = new OfflineAudioContext(2, length, sampleRate)

      // 3. Create Voice Graph
      const voiceSource = this.ctx.createBufferSource()
      voiceSource.buffer = voiceBuffer

      // Voice Gains
      const voiceMainGain = this.ctx.createGain()
      voiceMainGain.gain.value = options.voiceVolume

      // Studio FX Chain
      const compressor = this.ctx.createDynamicsCompressor()
      // Polish settings
      compressor.threshold.value = -24
      compressor.knee.value = 30
      compressor.ratio.value = 12
      compressor.attack.value = 0.003
      compressor.release.value = 0.25

      const dryGain = this.ctx.createGain()
      const wetGain = this.ctx.createGain() // Reverb send

      if (options.isStudioMode) {
        // Reverb
        const convolver = this.ctx.createConvolver()
        convolver.buffer = createReverb(this.ctx)

        // Routing: Source -> Compressor -> Reverb/Dry Split
        voiceSource.connect(compressor)

        compressor.connect(dryGain)
        compressor.connect(convolver)
        convolver.connect(wetGain)

        // FX Levels
        dryGain.gain.value = 0.7 // Adjusted for mix balance
        wetGain.gain.value = 0.3 // Standard shimmer

        wetGain.connect(voiceMainGain)
        dryGain.connect(voiceMainGain)
      } else {
        // Direct Dry
        voiceSource.connect(voiceMainGain)
      }

      // Connect Voice Mix to Master
      voiceMainGain.connect(this.ctx.destination)

      // Sync model:
      // - Voice starts at t=0.
      // - Beat should start at the same beat "phase" it was at when recording started.
      // - `nudge` shifts the beat phase to align vocals (positive nudge = delay beat relative to voice).
      const beatOffsetSeconds = (options.beatOffsetMs || 0) / 1000
      const nudgeSeconds = (options.nudge || 0) / 1000
      voiceSource.start(0)

      // 4. Create Beat Graph (if exists)
      if (beatBuffer && beatUrl) {
        const beatDuration = beatBuffer.duration || 1
        const phaseSeconds = beatOffsetSeconds - nudgeSeconds
        const beatStartOffset =
          ((phaseSeconds % beatDuration) + beatDuration) % beatDuration

        const beatSource = this.ctx.createBufferSource()
        beatSource.buffer = beatBuffer
        beatSource.loop = true // Loop beat if voice recording is longer than beat duration

        const beatGain = this.ctx.createGain()
        beatGain.gain.value = options.beatVolume

        beatSource.connect(beatGain)
        beatGain.connect(this.ctx.destination)
        beatSource.start(0, beatStartOffset)
      }

      // 5. Render
      const renderedBuffer = await this.ctx.startRendering()

      // 6. Convert to WAV
      return this.bufferToWav(renderedBuffer)
    } catch (err) {
      console.error('Mixing failed:', err)
      throw new Error(
        err instanceof Error ? err.message : 'Failed to mix audio tracks'
      )
    }
  }

  private async fetchAndDecode(url: string): Promise<AudioBuffer> {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const tempCtx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )()
    try {
      return await tempCtx.decodeAudioData(arrayBuffer)
    } finally {
      await tempCtx.close()
    }
  }

  // Simple WAV encoder
  private bufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels
    const length = buffer.length * numOfChan * 2 + 44
    const bufferArr = new ArrayBuffer(length)
    const view = new DataView(bufferArr)
    const channels = []
    let i
    let sample
    let offset = 0
    let pos = 0

    // write WAVE header
    setUint32(0x46464952) // "RIFF"
    setUint32(36 + buffer.length * numOfChan * 2) // file length - 8
    setUint32(0x45564157) // "WAVE"
    setUint32(0x20746d66) // "fmt " chunk
    setUint32(16) // length = 16
    setUint16(1) // PCM (uncompressed)
    setUint16(numOfChan)
    setUint32(buffer.sampleRate)
    setUint32(buffer.sampleRate * 2 * numOfChan) // avg. bytes/sec
    setUint16(numOfChan * 2) // block-align
    setUint16(16) // 16-bit (hardcoded in this loop)

    setUint32(0x61746164) // "data" - chunk
    setUint32(buffer.length * numOfChan * 2) // chunk length

    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i))

    while (pos < buffer.length) {
      for (i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][pos])) // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0 // scale to 16-bit signed int
        view.setInt16(44 + offset, sample, true) // write 16-bit sample
        offset += 2
      }
      pos++
    }

    return new Blob([bufferArr], { type: 'audio/wav' })

    function setUint16(data: number) {
      view.setUint16(pos, data, true)
      pos += 2
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true)
      pos += 4
    }
  }
}

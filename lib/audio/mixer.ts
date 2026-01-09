export class AudioMixer {
  private ctx: OfflineAudioContext | null = null

  async mix(
    voiceUrl: string,
    beatUrl: string,
    voiceVolume: number = 1.0,
    beatVolume: number = 0.8
  ): Promise<Blob> {
    try {
      // 1. Fetch both audio files
      const [voiceBuffer, beatBuffer] = await Promise.all([
        this.fetchAndDecode(voiceUrl),
        this.fetchAndDecode(beatUrl),
      ])

      // 2. Setup OfflineAudioContext
      // Duration is the longer of the two, or usually the voice duration wins?
      // For a session, we usually want the full voice recording. If beat is longer, we might fade out?
      // Let's use the voice length as the canonical length, or max of both.
      // Usually beat continues, but we might want to cut it at the end of the voice?
      // Let's stick to voice duration for the session.
      const duration = voiceBuffer.duration
      const sampleRate = 44100
      const length = duration * sampleRate

      this.ctx = new OfflineAudioContext(2, length, sampleRate)

      // 3. Create Sources
      const voiceSource = this.ctx.createBufferSource()
      voiceSource.buffer = voiceBuffer

      const beatSource = this.ctx.createBufferSource()
      beatSource.buffer = beatBuffer

      // 4. Create Gains
      const voiceGain = this.ctx.createGain()
      voiceGain.gain.value = voiceVolume

      const beatGain = this.ctx.createGain()
      beatGain.gain.value = beatVolume

      // 5. Connect Graph
      voiceSource.connect(voiceGain)
      voiceGain.connect(this.ctx.destination)

      beatSource.connect(beatGain)
      beatGain.connect(this.ctx.destination)

      // 6. Start
      voiceSource.start(0)
      beatSource.start(0)

      // 7. Render
      const renderedBuffer = await this.ctx.startRendering()

      // 8. Convert to Blob (WAV or WEBM via encoder)
      // Browsers don't support encoding to WEBM from AudioBuffer natively easily without libraries.
      // Easiest is to encode to WAV.
      return this.bufferToWav(renderedBuffer)
    } catch (err) {
      console.error('Mixing failed:', err)
      throw new Error('Failed to mix audio tracks')
    }
  }

  private async fetchAndDecode(url: string): Promise<AudioBuffer> {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    // We need a temp context to decode if we're not inside the mix method's offline context yet?
    // Actually AudioContext (not offline) is better for decoding usually, but Offline can too.
    // Spec says OfflineAudioContext can decode.
    // But we can just use a standard context for decoding logic to be safe.
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

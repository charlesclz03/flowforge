/**
 * Logic for mixing beat and vocals on the client side using OfflineAudioContext
 */
export async function mixAudio(
  vocalUrl: string,
  beatUrl: string,
  options: {
    beatVolume: number
    vocalVolume: number
    nudgeMs: number
    reverb: boolean
  }
): Promise<Blob> {
  const AudioContextClass =
    (
      window as unknown as {
        AudioContext: typeof AudioContext
        webkitAudioContext: typeof AudioContext
      }
    ).AudioContext ||
    (
      window as unknown as {
        AudioContext: typeof AudioContext
        webkitAudioContext: typeof AudioContext
      }
    ).webkitAudioContext

  const tempCtx = new AudioContextClass()

  // Fetch and decode both files
  const [vocalBuffer, beatBuffer] = await Promise.all([
    fetch(vocalUrl)
      .then((r) => r.arrayBuffer())
      .then((ab) => tempCtx.decodeAudioData(ab)),
    fetch(beatUrl)
      .then((r) => r.arrayBuffer())
      .then((ab) => tempCtx.decodeAudioData(ab)),
  ])

  const sampleRate = beatBuffer.sampleRate
  const duration = Math.max(vocalBuffer.duration, beatBuffer.duration)
  const offlineCtx = new OfflineAudioContext(
    2,
    duration * sampleRate,
    sampleRate
  )

  // Vocal Source
  const vocalSource = offlineCtx.createBufferSource()
  vocalSource.buffer = vocalBuffer
  const vocalGain = offlineCtx.createGain()
  vocalGain.gain.value = options.vocalVolume
  vocalSource.connect(vocalGain)

  // Beat Source
  const beatSource = offlineCtx.createBufferSource()
  beatSource.buffer = beatBuffer
  const beatGain = offlineCtx.createGain()
  beatGain.gain.value = options.beatVolume
  beatSource.connect(beatGain)

  // Reverb
  if (options.reverb) {
    const convolver = offlineCtx.createConvolver()
    // Simple impulse response
    const impulseLength = sampleRate * 2
    const impulse = offlineCtx.createBuffer(2, impulseLength, sampleRate)
    for (let i = 0; i < 2; i++) {
      const channel = impulse.getChannelData(i)
      for (let j = 0; j < impulseLength; j++) {
        channel[j] =
          (Math.random() * 2 - 1) * Math.pow(1 - j / impulseLength, 2)
      }
    }
    convolver.buffer = impulse
    const wetGain = offlineCtx.createGain()
    wetGain.gain.value = 0.3
    vocalGain.connect(convolver)
    convolver.connect(wetGain)
    wetGain.connect(offlineCtx.destination)
  }

  vocalGain.connect(offlineCtx.destination)
  beatGain.connect(offlineCtx.destination)

  const vocalStart = options.nudgeMs < 0 ? Math.abs(options.nudgeMs) / 1000 : 0
  const beatStart = options.nudgeMs > 0 ? options.nudgeMs / 1000 : 0

  vocalSource.start(vocalStart)
  beatSource.start(beatStart)

  const renderedBuffer = await offlineCtx.startRendering()

  // Convert AudioBuffer to WAV Blob
  return audioBufferToWavBlob(renderedBuffer)
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels
  const length = buffer.length * numOfChan * 2 + 44
  const outBuffer = new ArrayBuffer(length)
  const view = new DataView(outBuffer)
  const channels = []
  let sample
  let offset = 0
  let pos = 0

  function setUint16(data: number) {
    view.setUint16(pos, data, true)
    pos += 2
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true)
    pos += 4
  }

  // write header
  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8) // file length - 8
  setUint32(0x45564157) // "WAVE"
  setUint32(0x20746d66) // "fmt " chunk
  setUint32(16) // length = 16
  setUint16(1) // PCM (uncompressed)
  setUint16(numOfChan)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * 2 * numOfChan) // avg. bytes/sec
  setUint16(numOfChan * 2) // block-align
  setUint16(16) // 16-bit (hardcoded)

  setUint32(0x61746164) // "data" - chunk
  setUint32(length - pos - 4) // chunk length

  // write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset])) // clamp
      sample = (sample < 0 ? sample * 0x8000 : sample * 0x7fff) | 0 // scale to 16-bit signed int
      view.setInt16(pos, sample, true) // write 16-bit sample
      pos += 2
    }
    offset++
  }

  return new Blob([outBuffer], { type: 'audio/wav' })
}

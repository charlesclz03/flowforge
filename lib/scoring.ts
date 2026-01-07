/**
 * Analyze audio buffer to calculate Flow Score and Vibe
 */
export async function analyzeAudio(
  blob: Blob
): Promise<{ score: number; vibe: string }> {
  try {
    const arrayBuffer = await blob.arrayBuffer()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    const rawData = audioBuffer.getChannelData(0) // Use left channel
    const sampleRate = audioBuffer.sampleRate
    const duration = audioBuffer.duration

    // 1. Calculate Active Vocal Time (Flow Density)
    let activeSamples = 0
    const threshold = 0.05 // Noise gate threshold

    // Optimization: Skip samples to save CPU (Analyze every 10th sample)
    const step = 10
    for (let i = 0; i < rawData.length; i += step) {
      if (Math.abs(rawData[i]) > threshold) {
        activeSamples += step
      }
    }

    const activeTime = activeSamples / sampleRate
    const flowDensity = Math.min(1, activeTime / duration)
    const score = Math.round(flowDensity * 10000)

    // 2. Vibe Check (RMS & Variance)
    let sumSquares = 0
    for (let i = 0; i < rawData.length; i += step * 10) {
      // Sparsely sample for RMS
      sumSquares += rawData[i] * rawData[i]
    }
    const rms = Math.sqrt(sumSquares / (rawData.length / (step * 10)))

    let vibe = 'Locked In'
    if (rms > 0.2) vibe = 'Hype'
    else if (rms < 0.05) vibe = 'Chill'

    // Cleanup
    audioContext.close()

    return { score, vibe }
  } catch (error) {
    console.error('Audio Analysis Failed:', error)
    return { score: 0, vibe: 'Raw' }
  }
}

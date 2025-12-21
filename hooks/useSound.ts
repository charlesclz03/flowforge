import { useCallback, useRef, useEffect } from 'react'

type SoundType = 'click' | 'hover' | 'success' | 'start' | 'stop'

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Initialize AudioContext on mount (lazy load)
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContext) {
      audioContextRef.current = new AudioContext()
    }
  }, [])

  const play = useCallback((type: SoundType) => {
    if (!audioContextRef.current) return

    // Resume context if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }

    const ctx = audioContextRef.current
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime

    switch (type) {
      case 'click':
        // Sharp high-pitch click (Nintendo Switch style)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(800, now)
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1)
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
        osc.start(now)
        osc.stop(now + 0.1)
        break

      case 'hover':
        // Very subtle blip
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(400, now)
        gain.gain.setValueAtTime(0.05, now)
        gain.gain.linearRampToValueAtTime(0, now + 0.05)
        osc.start(now)
        osc.stop(now + 0.05)
        break

      case 'start':
        // Ascending sci-fi powerup
        osc.type = 'sine'
        osc.frequency.setValueAtTime(200, now)
        osc.frequency.linearRampToValueAtTime(600, now + 0.3)
        gain.gain.setValueAtTime(0.2, now)
        gain.gain.linearRampToValueAtTime(0, now + 0.3)
        osc.start(now)
        osc.stop(now + 0.3)
        break

      case 'stop':
        // Descending powerdown
        osc.type = 'sine'
        osc.frequency.setValueAtTime(600, now)
        osc.frequency.linearRampToValueAtTime(200, now + 0.3)
        gain.gain.setValueAtTime(0.2, now)
        gain.gain.linearRampToValueAtTime(0, now + 0.3)
        osc.start(now)
        osc.stop(now + 0.3)
        break

      case 'success':
        // Major triad arpeggio
        const playNote = (freq: number, startTime: number) => {
          const o = ctx.createOscillator()
          const g = ctx.createGain()
          o.type = 'sine'
          o.connect(g)
          g.connect(ctx.destination)

          o.frequency.value = freq
          g.gain.setValueAtTime(0.2, startTime)
          g.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)

          o.start(startTime)
          o.stop(startTime + 0.4)
        }
        playNote(523.25, now) // C5
        playNote(659.25, now + 0.1) // E5
        playNote(783.99, now + 0.2) // G5
        playNote(1046.5, now + 0.3) // C6
        break
    }
  }, [])

  return { play }
}

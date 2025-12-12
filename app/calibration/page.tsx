'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, RefreshCw, Volume2 } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Container } from '@/components/atoms/Container'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { toast } from 'react-hot-toast'

const TOTAL_ROUNDS = 5

export default function CalibrationPage() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'calibrating' | 'results'>('intro')
  const [round, setRound] = useState(0)
  const [results, setResults] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const beepTimeRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Initialize AudioContext
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close()
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const playBeep = () => {
    if (!audioContextRef.current) return

    setIsPlaying(true)

    // Random delay between 1s and 3s
    const delay = Math.random() * 2000 + 1000

    timeoutRef.current = setTimeout(() => {
      const ctx = audioContextRef.current!
      if (ctx.state === 'suspended') ctx.resume()

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'sine'
      osc.frequency.value = 880 // A5

      const now = ctx.currentTime
      osc.start(now)
      osc.stop(now + 0.1) // 100ms beep

      // Ramp volume to avoid click
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(1, now + 0.01)
      gain.gain.linearRampToValueAtTime(0, now + 0.1)

      beepTimeRef.current = Date.now()

      // Auto-fail if not tapped within 2s? No, just wait.
    }, delay)
  }

  const handleStart = () => {
    setStep('calibrating')
    setRound(1)
    setResults([])
    playBeep()
  }

  const handleTap = () => {
    if (!isPlaying) return // Ignore taps before beep matches logic?
    // Wait, we need to know if the beep HAS played.
    // Ideally we shouldn't enable the button until the beep starts?
    // But latency includes "hearing" it.
    // The beep plays at `beepTimeRef.current`.

    const now = Date.now()
    if (now < beepTimeRef.current) {
      // Tapped too early (anticipation)
      toast.error('Too early! Wait for the beep.')
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      playBeep() // Retry this round
      return
    }

    const latency = now - beepTimeRef.current
    // Filter unrealistic values (e.g. > 1s is probably attention lapse, but we record it)

    const newResults = [...results, latency]
    setResults(newResults)

    if (newResults.length < TOTAL_ROUNDS) {
      setRound((r) => r + 1)
      setIsPlaying(false)
      beepTimeRef.current = Number.MAX_SAFE_INTEGER // Reset
      playBeep()
    } else {
      setStep('results')
      saveLatency(newResults)
    }
  }

  const saveLatency = (finalResults: number[]) => {
    // Drop min and max to clean outliers
    const sorted = [...finalResults].sort((a, b) => a - b)
    let avg = 0
    if (sorted.length > 2) {
      // Remove outlier
      const cleaned = sorted.slice(1, -1)
      avg = cleaned.reduce((a, b) => a + b, 0) / cleaned.length
    } else {
      avg = sorted.reduce((a, b) => a + b, 0) / sorted.length
    }

    // Subtract typical human reaction time (~200ms)?
    // "Audio Latency" usually refers to Hardware/System delay.
    // If I tap 250ms after beep, 200ms might be muscle/brain, 50ms system.
    // We want to align VOCALS.
    // If I hear beat at T, I rap at T + (Brain + System).
    // Recorded at T + (Brain + System + InputLatency).
    // I *intend* to rap at T.
    // So the total offset is what we want to compensate for.
    // Keeping the full value is usually "safer" and user can Nudge from there.
    // But 300ms shift might be weird if it's mostly brain lag.
    // Let's store the raw value for now, or maybe subtract 150ms constant?
    // Let's store raw and apply a heuristic in the player.

    const finalLatency = Math.round(avg)
    localStorage.setItem('flowforge_latency', finalLatency.toString())
    toast.success('Calibration saved!')
  }

  const getAverage = () => {
    if (results.length === 0) return 0
    return Math.round(results.reduce((a, b) => a + b, 0) / results.length)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />
      <Container className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
        {step === 'intro' && (
          <div className="text-center max-w-md space-y-6">
            <Volume2 className="w-16 h-16 text-accent-purple mx-auto animate-pulse" />
            <h1 className="text-3xl font-bold font-header tracking-tighter">Audio Calibration</h1>
            <p className="text-text-secondary">
              We'll play 5 beeps. Tap the button exactly when you hear the sound to measure your
              device's latency.
            </p>
            <Button size="lg" onClick={handleStart} leftIcon={<Check />}>
              Start Calibration
            </Button>
            <div className="text-xs text-text-tertiary">
              Recommended: Wear headphones and use a quiet room.
            </div>
          </div>
        )}

        {step === 'calibrating' && (
          <div
            className="text-center w-full max-w-md cursor-pointer h-96 flex flex-col items-center justify-center relative touch-none select-none"
            onPointerDown={handleTap}
            // Use pointer down for faster reaction
          >
            {/* Big Tap Area */}
            <div className="absolute inset-0 bg-accent-purple/5 rounded-3xl border border-accent-purple/20 animate-pulse" />

            <div className="relative z-10 space-y-8 pointer-events-none">
              <h2 className="text-2xl font-bold">
                {round} / {TOTAL_ROUNDS}
              </h2>
              <p className="text-text-secondary">Tap anywhere when you hear the beep!</p>

              <div className="w-32 h-32 rounded-full bg-accent-purple/20 flex items-center justify-center mx-auto">
                <div
                  className={`w-24 h-24 rounded-full bg-accent-purple transition-transform duration-75 ${isPlaying ? 'scale-95 opacity-80' : 'scale-100'}`}
                />
              </div>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="text-center max-w-md space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto text-green-500">
              <Check size={40} />
            </div>
            <h1 className="text-3xl font-bold">Calibration Complete</h1>

            <div className="bg-background-card p-6 rounded-xl border border-white/5 space-y-2">
              <div className="text-text-secondary uppercase text-xs tracking-wider">
                Estimated Latency
              </div>
              <div className="text-5xl font-numeral text-white">{getAverage()}ms</div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button onClick={() => router.push('/practice')} variant="primary">
                Go to Practice
              </Button>
              <Button onClick={() => setStep('intro')} variant="ghost" leftIcon={<RefreshCw />}>
                Retest
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}

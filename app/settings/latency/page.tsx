'use client'

import { useState, useRef, useCallback } from 'react'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { PageHeader } from '@/components/organisms/common'
import { Card } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { ChevronRight, Play, CheckCircle2 } from 'lucide-react'

const LATENCY_KEY = 'flowforge_audio_latency_ms'

export default function LatencyWizard() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'calibrating' | 'done'>('intro')
  const [latency, setLatency] = useState<number>(0)
  const [taps, setTaps] = useState<number[]>([])

  const audioCtxRef = useRef<AudioContext | null>(null)
  const nextBeepTimeRef = useRef<number>(0)
  const isCalibratingRef = useRef(false)

  const playBeep = useCallback((time: number) => {
    if (!audioCtxRef.current) return
    const osc = audioCtxRef.current.createOscillator()
    const gain = audioCtxRef.current.createGain()
    osc.connect(gain)
    gain.connect(audioCtxRef.current.destination)

    osc.frequency.setValueAtTime(880, time)
    gain.gain.setValueAtTime(0.1, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1)

    osc.start(time)
    osc.stop(time + 0.1)
  }, [])

  const startCalibration = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext
    audioCtxRef.current = new AudioContextClass()
    setStep('calibrating')
    isCalibratingRef.current = true
    setTaps([])

    const interval = 1000 // 1 second between beeps
    nextBeepTimeRef.current = (audioCtxRef.current?.currentTime || 0) + 0.5

    const tick = () => {
      if (!isCalibratingRef.current || !audioCtxRef.current) return
      const now = audioCtxRef.current.currentTime
      if (now >= nextBeepTimeRef.current - 0.1) {
        playBeep(nextBeepTimeRef.current)
        nextBeepTimeRef.current += interval / 1000
      }
      requestAnimationFrame(tick)
    }
    tick()
  }

  const handleTap = () => {
    if (step !== 'calibrating' || !audioCtxRef.current) return

    const tapTime = audioCtxRef.current?.currentTime || 0
    // Find the closest beep time (either passed or upcoming)
    const interval = 1.0
    const relativeTime = (tapTime - 0.5) % interval
    const diff = relativeTime > interval / 2 ? relativeTime - interval : relativeTime

    const diffMs = Math.round(diff * 1000)
    setTaps((prev) => {
      const newTaps = [...prev, diffMs]
      if (newTaps.length >= 10) {
        finishCalibration(newTaps)
      }
      return newTaps
    })

    // Simple visual feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  const finishCalibration = (allTaps: number[]) => {
    isCalibratingRef.current = false
    // Calculate average, excluding outliers
    const avg = Math.round(allTaps.reduce((a, b) => a + b, 0) / allTaps.length)
    setLatency(avg)
    setStep('done')
    localStorage.setItem(LATENCY_KEY, avg.toString())
    toast.success(`Calibration Complete: ${avg}ms`)
  }

  return (
    <OnboardingLayout showBackButton onBack={() => router.back()}>
      <div className="max-w-md mx-auto py-8 px-4 space-y-8">
        <PageHeader
          title="Latency Wizard"
          description="Sync your vocals perfectly by calibrating your device's audio delay."
        />

        <Card padding="lg">
          {step === 'intro' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple">
                  <Play size={32} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg">How it works</h3>
                <p className="text-text-secondary text-sm">
                  You'll hear a series of beeps. Tap the button exactly when you hear the beep.
                  We'll measure the difference and auto-adjust your recordings.
                </p>
              </div>
              <Button onClick={startCalibration} className="w-full">
                Start Calibration
              </Button>
            </div>
          )}

          {step === 'calibrating' && (
            <div className="space-y-8 text-center">
              <div className="relative h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-accent-purple/10 rounded-full blur-3xl animate-pulse" />
                <div className="text-4xl font-black text-white">{10 - taps.length}</div>
              </div>

              <div className="space-y-4">
                <Button
                  size="lg"
                  onClick={handleTap}
                  className="w-full h-24 text-2xl font-black rounded-3xl bg-white text-black active:scale-95 transition-transform"
                >
                  TAP!
                </Button>
                <div className="flex justify-center gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-full rounded-full transition-colors ${i < taps.length ? 'bg-accent-purple' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green">
                  <CheckCircle2 size={32} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Success!</h3>
                <p className="text-text-secondary text-sm">
                  Your device latency is set to{' '}
                  <span className="text-white font-bold">{latency}ms</span>.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => setStep('intro')} variant="ghost">
                  Recalibrate
                </Button>
                <Button onClick={() => router.back()} className="bg-white text-black">
                  Done
                </Button>
              </div>
            </div>
          )}
        </Card>

        {step === 'intro' && (
          <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-2xl p-4 flex gap-4 items-start">
            <div className="p-2 rounded-lg bg-accent-purple/20 text-accent-purple">
              <ChevronRight size={16} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-accent-purple">Pro Tip</p>
              <p className="text-sm text-text-secondary">
                Use wired headphones for the lowest possible latency and best calibration results.
              </p>
            </div>
          </div>
        )}
      </div>
    </OnboardingLayout>
  )
}

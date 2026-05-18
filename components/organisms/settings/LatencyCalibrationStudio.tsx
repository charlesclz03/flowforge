'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Card } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import {
  Bluetooth,
  CheckCircle2,
  Headphones,
  Play,
  RotateCcw,
  Save,
  Smartphone,
  Waves,
} from 'lucide-react'
import {
  CALIBRATION_MAX_MS,
  CALIBRATION_MIN_MS,
  CALIBRATION_PROFILES,
  CalibrationComputation,
  CalibrationProfileId,
  CalibrationState,
  DEFAULT_CALIBRATION_PROFILE_ID,
  computeCalibrationFromTapDiffs,
  formatSignedLatencyMs,
  getCalibrationState,
  normalizeLatencyMs,
  saveCalibrationState,
} from '@/lib/audio/calibration'

const REQUIRED_TAPS = 10
const BEEP_INTERVAL_SECONDS = 1
const FIRST_BEEP_LEAD_SECONDS = 0.5

const DEFAULT_CALIBRATION_STATE: CalibrationState = {
  activeProfileId: DEFAULT_CALIBRATION_PROFILE_ID,
  profiles: {
    phone_speaker: 0,
    wired_headphones: 0,
    bluetooth: 0,
  },
}

function getProfileIcon(profileId: CalibrationProfileId) {
  switch (profileId) {
    case 'wired_headphones':
      return <Headphones size={16} />
    case 'bluetooth':
      return <Bluetooth size={16} />
    default:
      return <Smartphone size={16} />
  }
}

export default function LatencyCalibrationStudio() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'calibrating' | 'done'>('intro')
  const [savedState, setSavedState] = useState<CalibrationState>(
    DEFAULT_CALIBRATION_STATE
  )
  const [draftState, setDraftState] = useState<CalibrationState>(
    DEFAULT_CALIBRATION_STATE
  )
  const [tapDiffs, setTapDiffs] = useState<number[]>([])
  const [result, setResult] = useState<CalibrationComputation | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncTesting, setIsSyncTesting] = useState(false)
  const [isSyncPulseActive, setIsSyncPulseActive] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const nextBeepTimeRef = useRef(0)
  const isCalibratingRef = useRef(false)
  const calibrationRafRef = useRef<number | null>(null)
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const syncPulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeProfileId = draftState.activeProfileId
  const activeLatencyMs = draftState.profiles[activeProfileId]
  const currentProfileDefinition = CALIBRATION_PROFILES.find(
    (profile) => profile.id === activeProfileId
  )

  const hasUnsavedChanges = useMemo(() => {
    if (!isLoaded) return false

    if (savedState.activeProfileId !== draftState.activeProfileId) return true

    return CALIBRATION_PROFILES.some(
      (profile) =>
        normalizeLatencyMs(savedState.profiles[profile.id]) !==
        normalizeLatencyMs(draftState.profiles[profile.id])
    )
  }, [draftState, isLoaded, savedState])

  const ensureAudioContext = useCallback(async () => {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext

    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContextClass()
    }

    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume()
    }

    return audioCtxRef.current
  }, [])

  const playBeepAt = useCallback((ctx: AudioContext, time: number) => {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, time)
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(0.12, time + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.11)

    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start(time)
    oscillator.stop(time + 0.11)
  }, [])

  const stopCalibrationTicker = useCallback(() => {
    isCalibratingRef.current = false
    if (calibrationRafRef.current !== null) {
      cancelAnimationFrame(calibrationRafRef.current)
      calibrationRafRef.current = null
    }
  }, [])

  const updateActiveLatency = useCallback((nextLatencyMs: number) => {
    setDraftState((previous) => ({
      ...previous,
      profiles: {
        ...previous.profiles,
        [previous.activeProfileId]: normalizeLatencyMs(nextLatencyMs),
      },
    }))
  }, [])

  const finishCalibration = useCallback(
    (allTapDiffsMs: number[]) => {
      stopCalibrationTicker()

      const computed = computeCalibrationFromTapDiffs(allTapDiffsMs)
      setResult(computed)
      updateActiveLatency(computed.latencyMs)
      setStep('done')

      toast.success(
        `Suggested ${formatSignedLatencyMs(computed.latencyMs)} from ${computed.usedSamples}/${allTapDiffsMs.length} stable taps`
      )
    },
    [stopCalibrationTicker, updateActiveLatency]
  )

  const startCalibration = useCallback(async () => {
    const ctx = await ensureAudioContext()
    setStep('calibrating')
    setResult(null)
    setTapDiffs([])
    isCalibratingRef.current = true
    nextBeepTimeRef.current = ctx.currentTime + FIRST_BEEP_LEAD_SECONDS

    const tick = () => {
      if (!isCalibratingRef.current || !audioCtxRef.current) return

      const now = audioCtxRef.current.currentTime
      if (now >= nextBeepTimeRef.current - 0.08) {
        playBeepAt(audioCtxRef.current, nextBeepTimeRef.current)
        nextBeepTimeRef.current += BEEP_INTERVAL_SECONDS
      }

      calibrationRafRef.current = requestAnimationFrame(tick)
    }

    calibrationRafRef.current = requestAnimationFrame(tick)
  }, [ensureAudioContext, playBeepAt])

  const handleTap = useCallback(() => {
    if (step !== 'calibrating' || !audioCtxRef.current) return

    const tapTime = audioCtxRef.current.currentTime
    const relative = tapTime - FIRST_BEEP_LEAD_SECONDS
    const wrapped =
      ((relative % BEEP_INTERVAL_SECONDS) + BEEP_INTERVAL_SECONDS) %
      BEEP_INTERVAL_SECONDS
    const signedDiffSeconds =
      wrapped > BEEP_INTERVAL_SECONDS / 2
        ? wrapped - BEEP_INTERVAL_SECONDS
        : wrapped
    const diffMs = Math.round(signedDiffSeconds * 1000)

    setTapDiffs((previous) => {
      const next = [...previous, diffMs]
      if (next.length >= REQUIRED_TAPS) {
        finishCalibration(next)
      }
      return next
    })

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }, [finishCalibration, step])

  const playSyncPulse = useCallback(async () => {
    const ctx = await ensureAudioContext()
    const time = ctx.currentTime + 0.03
    playBeepAt(ctx, time)

    setIsSyncPulseActive(true)
    if (syncPulseTimeoutRef.current) {
      clearTimeout(syncPulseTimeoutRef.current)
    }
    syncPulseTimeoutRef.current = setTimeout(() => {
      setIsSyncPulseActive(false)
    }, 140)
  }, [ensureAudioContext, playBeepAt])

  const handleSaveChanges = useCallback(() => {
    setIsSaving(true)
    try {
      const saved = saveCalibrationState(draftState)
      setSavedState(saved)
      setDraftState(saved)
      toast.success(
        `Saved ${formatSignedLatencyMs(saved.profiles[saved.activeProfileId])} for ${CALIBRATION_PROFILES.find((profile) => profile.id === saved.activeProfileId)?.label || 'current output'}`
      )
    } finally {
      setIsSaving(false)
    }
  }, [draftState])

  useEffect(() => {
    const state = getCalibrationState()
    setSavedState(state)
    setDraftState(state)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isSyncTesting) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
      return
    }

    void playSyncPulse()
    syncIntervalRef.current = setInterval(() => {
      void playSyncPulse()
    }, 1000)

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
    }
  }, [isSyncTesting, playSyncPulse])

  useEffect(() => {
    return () => {
      stopCalibrationTicker()

      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
      if (syncPulseTimeoutRef.current) {
        clearTimeout(syncPulseTimeoutRef.current)
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        void audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [stopCalibrationTicker])

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-5">
      <Card padding="lg">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold tracking-widest uppercase text-accent-blue">
              Active Output Profile
            </p>
            <p className="text-sm text-text-secondary">
              Save separate calibration values per audio output.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {CALIBRATION_PROFILES.map((profile) => {
              const selected = profile.id === activeProfileId
              const value = draftState.profiles[profile.id]
              return (
                <button
                  key={profile.id}
                  onClick={() =>
                    setDraftState((previous) => ({
                      ...previous,
                      activeProfileId: profile.id,
                    }))
                  }
                  aria-pressed={selected}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-all ${
                    selected
                      ? 'border-accent-purple bg-accent-purple/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-accent-purple">
                        {getProfileIcon(profile.id)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {profile.label}
                        </p>
                        <p className="text-[11px] text-text-secondary">
                          {profile.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-white">
                      {formatSignedLatencyMs(value)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-accent-purple">
                Current Calibration
              </p>
              <p className="text-sm text-text-secondary">
                {currentProfileDefinition?.label ?? 'Selected output'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">
                {formatSignedLatencyMs(activeLatencyMs)}
              </p>
              <p className="text-[11px] text-text-tertiary">
                Range {CALIBRATION_MIN_MS}ms to {CALIBRATION_MAX_MS}ms
              </p>
            </div>
          </div>

          <input
            type="range"
            min={CALIBRATION_MIN_MS}
            max={CALIBRATION_MAX_MS}
            step={10}
            value={activeLatencyMs}
            aria-label={`Latency adjustment for ${currentProfileDefinition?.label ?? 'selected output'}`}
            onChange={(event) =>
              updateActiveLatency(Number(event.target.value))
            }
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-purple"
          />

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => updateActiveLatency(activeLatencyMs - 10)}
            >
              -10ms
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => updateActiveLatency(activeLatencyMs + 10)}
            >
              +10ms
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              leftIcon={<RotateCcw size={16} />}
              onClick={() => updateActiveLatency(0)}
            >
              Reset
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              leftIcon={<Play size={16} />}
              onClick={() => void playSyncPulse()}
            >
              One Pulse
            </Button>
            <Button
              variant={isSyncTesting ? 'primary' : 'secondary'}
              className="flex-1"
              leftIcon={<Waves size={16} />}
              onClick={() => setIsSyncTesting((previous) => !previous)}
            >
              {isSyncTesting ? 'Stop Test' : 'Loop Test'}
            </Button>
          </div>

          <div
            className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-text-secondary"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center justify-between">
              <span>Sync visual should match the beep pulse</span>
              <span
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  isSyncPulseActive ? 'bg-accent-green' : 'bg-white/20'
                }`}
              />
            </div>
          </div>

          {hasUnsavedChanges && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setDraftState(savedState)
                  setResult(null)
                }}
              >
                Discard
              </Button>
              <Button
                variant="primary"
                leftIcon={<Save size={16} />}
                onClick={handleSaveChanges}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </div>
          )}

          {!hasUnsavedChanges && isLoaded && (
            <p className="text-xs text-text-tertiary">
              Saved value:{' '}
              {formatSignedLatencyMs(
                savedState.profiles[savedState.activeProfileId]
              )}
            </p>
          )}
        </div>
      </Card>

      <Card padding="lg">
        {step === 'intro' && (
          <div className="space-y-5 text-center">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple">
                <Play size={28} />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg">Auto Calibration Wizard</h3>
              <p className="text-text-secondary text-sm">
                Tap exactly when you hear each beep. We remove outliers and
                compute a stable value for the selected profile.
              </p>
            </div>
            <Button onClick={() => void startCalibration()} className="w-full">
              Start Calibration
            </Button>
          </div>
        )}

        {step === 'calibrating' && (
          <div className="space-y-7 text-center">
            <div className="relative h-28 flex items-center justify-center">
              <div className="absolute inset-0 bg-accent-purple/10 rounded-full blur-3xl animate-pulse" />
              <div className="text-4xl font-black text-white">
                {REQUIRED_TAPS - tapDiffs.length}
              </div>
            </div>
            <div className="space-y-4">
              <Button
                size="lg"
                onClick={handleTap}
                className="w-full h-24 text-2xl font-black rounded-3xl bg-white text-black active:scale-95 transition-transform"
              >
                TAP
              </Button>
              <div className="grid grid-cols-10 gap-1">
                {[...Array(REQUIRED_TAPS)].map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full ${
                      index < tapDiffs.length
                        ? 'bg-accent-purple'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="space-y-5 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green">
                <CheckCircle2 size={32} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">Calibration Computed</h3>
              <p className="text-sm text-text-secondary">
                Recommended for{' '}
                {currentProfileDefinition?.label ?? 'current output'}
              </p>
              <p className="text-3xl font-black text-white">
                {formatSignedLatencyMs(result?.latencyMs ?? activeLatencyMs)}
              </p>
              {result && (
                <p className="text-xs text-text-tertiary">
                  Used {result.usedSamples} stable taps, discarded{' '}
                  {result.discardedSamples} outliers
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setStep('intro')
                  setTapDiffs([])
                }}
              >
                Recalibrate
              </Button>
              <Button
                variant="primary"
                onClick={
                  hasUnsavedChanges ? handleSaveChanges : () => router.back()
                }
              >
                {hasUnsavedChanges ? 'Save Result' : 'Done'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

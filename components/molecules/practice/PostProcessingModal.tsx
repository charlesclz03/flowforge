'use client'

import { useState, useRef, useEffect } from 'react'
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Play, Pause, RotateCcw, Volume2, Timer, Wand2 } from 'lucide-react'

interface PostProcessingProps {
  audioUrl: string
  onClose: () => void
  onSave: (config: {
    voiceVolume: number
    beatVolume: number
    nudge: number
    reverb: boolean
  }) => void
}

export function PostProcessingModal({
  audioUrl,
  onClose,
  onSave,
}: PostProcessingProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1.0)
  const [nudge, setNudge] = useState(0) // ms
  const [reverb, setReverb] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const delayNodeRef = useRef<DelayNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const convolverRef = useRef<ConvolverNode | null>(null)
  const wetGainRef = useRef<GainNode | null>(null)
  const dryGainRef = useRef<GainNode | null>(null)

  // Initialize Audio Context & Nodes
  useEffect(() => {
    if (!audioRef.current) return

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    const ctx = new AudioContextClass() as AudioContext
    audioCtxRef.current = ctx

    const source = ctx.createMediaElementSource(audioRef.current)
    const delay = ctx.createDelay(1.0)
    const gain = ctx.createGain()
    const convolver = ctx.createConvolver()
    const wetGain = ctx.createGain()
    const dryGain = ctx.createGain()

    // Create synthetic impulse response
    const sampleRate = ctx.sampleRate
    const length = sampleRate * 2 // 2 seconds
    const impulse = ctx.createBuffer(2, length, sampleRate)
    for (let i = 0; i < 2; i++) {
      const channel = impulse.getChannelData(i)
      for (let j = 0; j < length; j++) {
        channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 4)
      }
    }
    convolver.buffer = impulse

    // Routing
    source.connect(delay)
    delay.connect(gain)

    // Parallel paths for Reverb (Wet/Dry)
    gain.connect(dryGain)
    dryGain.connect(ctx.destination)

    gain.connect(convolver)
    convolver.connect(wetGain)
    wetGain.connect(ctx.destination)

    // Initial state
    delay.delayTime.value = 0.1 // Baseline for Nudge (0ms nudge = 100ms delay)
    wetGain.gain.value = 0
    dryGain.gain.value = 1

    sourceRef.current = source
    delayNodeRef.current = delay
    gainNodeRef.current = gain
    convolverRef.current = convolver
    wetGainRef.current = wetGain
    dryGainRef.current = dryGain

    return () => {
      ctx.close()
    }
  }, [])

  // Update Nudge
  useEffect(() => {
    if (delayNodeRef.current) {
      // 0ms nudge = 0.1s delay baseline
      // nudge is -100 to 100
      delayNodeRef.current.delayTime.value = 0.1 + nudge / 1000
    }
  }, [nudge])

  // Update Reverb
  useEffect(() => {
    if (wetGainRef.current && dryGainRef.current) {
      if (reverb) {
        wetGainRef.current.gain.linearRampToValueAtTime(
          0.4,
          audioCtxRef.current!.currentTime + 0.1
        )
        dryGainRef.current.gain.linearRampToValueAtTime(
          0.8,
          audioCtxRef.current!.currentTime + 0.1
        )
      } else {
        wetGainRef.current.gain.linearRampToValueAtTime(
          0,
          audioCtxRef.current!.currentTime + 0.1
        )
        dryGainRef.current.gain.linearRampToValueAtTime(
          1,
          audioCtxRef.current!.currentTime + 0.1
        )
      }
    }
  }, [reverb])

  // Update Volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume
    }
  }, [volume])

  const togglePlay = () => {
    if (!audioRef.current || !audioCtxRef.current) return

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Review & Studio FX">
      <div className="space-y-6">
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
          crossOrigin="anonymous"
        />

        {/* Player Controls */}
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            variant="ghost"
            className="rounded-full w-16 h-16 p-0"
            aria-label="Restart studio preview"
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime = 0
            }}
          >
            <RotateCcw size={24} />
          </Button>
          <Button
            size="lg"
            className="rounded-full w-20 h-20 p-0"
            aria-label={
              isPlaying ? 'Pause studio preview' : 'Play studio preview'
            }
            aria-pressed={isPlaying}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause size={32} />
            ) : (
              <Play size={32} className="ml-1" />
            )}
          </Button>
        </div>

        {/* Studio Rack */}
        <div className="space-y-4">
          <Card padding="md" className="bg-white/5 border-white/10">
            <div className="space-y-6">
              {/* Manual Nudge */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs uppercase font-bold tracking-widest text-text-tertiary">
                  <div className="flex items-center gap-2">
                    <Timer size={14} />
                    <span>Manual Nudge</span>
                  </div>
                  <span
                    className={
                      nudge === 0 ? 'text-text-tertiary' : 'text-accent-purple'
                    }
                  >
                    {nudge > 0 ? `+${nudge}` : nudge}ms
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Manual vocal nudge in milliseconds"
                  min="-100"
                  max="100"
                  value={nudge}
                  onChange={(e) => setNudge(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-purple"
                />
                <p className="text-[10px] text-text-tertiary text-center">
                  Shift vocals to match the beat
                </p>
              </div>

              {/* Vocal Volume */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs uppercase font-bold tracking-widest text-text-tertiary">
                  <div className="flex items-center gap-2">
                    <Volume2 size={14} />
                    <span>Vocal Mixer</span>
                  </div>
                  <span>{(volume * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  aria-label="Vocal volume"
                  min="0"
                  max="2"
                  step="0.1"
                  value={volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    setVolume(v)
                  }}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-blue"
                />
              </div>

              {/* FX Toggle */}
              <button
                type="button"
                aria-pressed={reverb}
                aria-label={`${reverb ? 'Disable' : 'Enable'} studio reverb`}
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(10)
                  }
                  setReverb(!reverb)
                }}
                className={`
                  w-full flex items-center justify-between p-4 rounded-xl border transition-all
                  ${
                    reverb
                      ? 'bg-accent-orange/10 border-accent-orange/30 text-accent-orange'
                      : 'bg-white/5 border-white/10 text-text-secondary'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Wand2 size={18} />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Studio Reverb
                  </span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full relative transition-colors ${reverb ? 'bg-accent-orange' : 'bg-white/20'}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${reverb ? 'left-5' : 'left-1'}`}
                  />
                </div>
              </button>
            </div>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Discard
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              // Emit config for saving
              onSave({
                voiceVolume: volume,
                beatVolume: 0.8, // Default for now
                nudge,
                reverb,
              })
              // Note: Parent handles toast
            }}
          >
            Save & Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

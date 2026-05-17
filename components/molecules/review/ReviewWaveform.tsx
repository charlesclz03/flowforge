'use client'

import { useEffect, useRef, useState } from 'react'
import type WaveSurfer from 'wavesurfer.js'
import { WaveformScrubber } from '@/components/molecules/practice/WaveformScrubber'

interface ReviewWaveformProps {
  url: string
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  height?: number
}

export function ReviewWaveform({
  url,
  currentTime,
  duration,
  onSeek,
  height = 64,
}: ReviewWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const waveSurferRef = useRef<WaveSurfer | null>(null)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    let isMounted = true
    let cleanup: (() => void) | undefined

    setUseFallback(false)

    void import('wavesurfer.js')
      .then(({ default: WaveSurferFactory }) => {
        if (!isMounted || !containerRef.current) return

        const wavesurfer = WaveSurferFactory.create({
          container: containerRef.current,
          url,
          height,
          waveColor: '#27272a',
          progressColor: '#a855f7',
          cursorColor: '#f43f5e',
          cursorWidth: 2,
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
          normalize: true,
          interact: true,
          dragToSeek: true,
          mediaControls: false,
        })

        waveSurferRef.current = wavesurfer

        const unsubInteraction = wavesurfer.on('interaction', (time) => {
          onSeek(time)
        })
        const unsubError = wavesurfer.on('error', () => {
          if (isMounted) setUseFallback(true)
        })

        cleanup = () => {
          unsubInteraction()
          unsubError()
          wavesurfer.destroy()
          if (waveSurferRef.current === wavesurfer) {
            waveSurferRef.current = null
          }
        }
      })
      .catch(() => {
        if (isMounted) setUseFallback(true)
      })

    return () => {
      isMounted = false
      cleanup?.()
    }
  }, [height, onSeek, url])

  useEffect(() => {
    const wavesurfer = waveSurferRef.current
    if (!wavesurfer) return

    const waveDuration = wavesurfer.getDuration()
    if (!Number.isFinite(waveDuration) || waveDuration <= 0) return

    const delta = Math.abs(wavesurfer.getCurrentTime() - currentTime)
    if (delta > 0.15) {
      wavesurfer.setTime(currentTime)
    }
  }, [currentTime])

  if (useFallback) {
    return (
      <WaveformScrubber
        url={url}
        progress={duration > 0 ? currentTime / duration : 0}
        color="#27272a"
        playedColor="#a855f7"
        onChange={onSeek}
        onSeek={onSeek}
        height={height}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg bg-black/20"
      style={{ height }}
      data-testid="review-waveform"
    />
  )
}

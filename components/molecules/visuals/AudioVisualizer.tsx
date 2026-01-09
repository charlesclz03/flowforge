'use client'

import { useEffect, useRef, memo } from 'react'

interface AudioVisualizerProps {
  isPlaying: boolean
  audioRef?: React.RefObject<HTMLAudioElement> // Optional: if we want to try real-time analysis
  mode?: 'simulation' | 'stream'
  stream?: MediaStream | null
  color?: string
  className?: string
}

export const AudioVisualizer = memo(function AudioVisualizer({
  isPlaying,
  mode = 'simulation',
  stream,
  color = '#A855F7', // accent-purple
  className,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyzerRef = useRef<AnalyserNode>()
  const audioCtxRef = useRef<AudioContext>()
  const sourceRef = useRef<MediaStreamAudioSourceNode>()
  const lastTimeRef = useRef(0)
  const lastDrawTimeRef = useRef(Date.now())

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize Audio Context for Stream Mode
    if (mode === 'stream' && stream && isPlaying && !audioCtxRef.current) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext
        audioCtxRef.current = new AudioContextClass()
        analyzerRef.current = audioCtxRef.current.createAnalyser()
        analyzerRef.current.fftSize = 64

        sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream)
        sourceRef.current.connect(analyzerRef.current)
      } catch (e) {
        console.error('Viz Error:', e)
      }
    }

    const bars = 20
    const gap = 2

    // Resize handling
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    })
    resizeObserver.observe(canvas)

    const draw = () => {
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      const barWidth = (width - (bars - 1) * gap) / bars

      ctx.clearRect(0, 0, width, height)

      // Dynamic color based on "intensity" (simulated or real)

      if (mode === 'stream' && analyzerRef.current) {
        if (!isPlaying) {
          ctx.globalAlpha = 0.2
          // Rounded placeholder
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.roundRect(0, height / 2 - 1, width, 2, 1)
          ctx.fill()
          return
        }
        const bufferLength = analyzerRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyzerRef.current.getByteFrequencyData(dataArray)

        for (let i = 0; i < bars; i++) {
          const index = Math.floor(i * (bufferLength / bars))
          const value = dataArray[index] || 0
          const barHeight = Math.max(4, (value / 255) * height) // Min height 4px
          const x = i * (barWidth + gap)
          const y = (height - barHeight) / 2

          ctx.fillStyle = color
          // Add some glow based on intensity
          ctx.shadowBlur = value > 128 ? 10 : 0
          ctx.shadowColor = color

          ctx.beginPath()
          // Use roundRect if supported, else rect
          if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barHeight, 4) // Radius 4
          } else {
            ctx.rect(x, y, barWidth, barHeight)
          }
          ctx.fill()
        }
      } else {
        // Simulation Mode - "Bouncier"
        const now = Date.now()
        if (isPlaying) {
          const delta = now - lastDrawTimeRef.current
          lastTimeRef.current += delta / 100
        }
        lastDrawTimeRef.current = now

        const time = lastTimeRef.current
        for (let i = 0; i < bars; i++) {
          // More complex wave for "gamified" feel
          const wave1 = Math.sin(time + i * 0.3)
          const wave2 = Math.cos(time * 0.5 + i * 0.1)
          const noise = (wave1 + wave2) / 2 + 0.5

          const random = isPlaying ? Math.random() * 0.2 : 0.05
          const hPercent = noise * 0.6 + random + 0.1
          const barHeight = Math.max(4, hPercent * height * 0.8)

          const x = i * (barWidth + gap)
          const y = (height - barHeight) / 2

          // Gradient or color shift
          ctx.fillStyle = color
          ctx.shadowBlur = 0

          ctx.beginPath()
          if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barHeight, 4)
          } else {
            ctx.rect(x, y, barWidth, barHeight)
          }
          ctx.fill()
        }
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    if (isPlaying) {
      draw()
    } else {
      draw() // Draw one frozen frame
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      resizeObserver.disconnect()
    }
  }, [isPlaying, mode, stream, color])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close()
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%' }} // Force layout
    />
  )
})

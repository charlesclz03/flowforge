'use client'

import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  isPlaying: boolean
  audioRef?: React.RefObject<HTMLAudioElement> // Optional: if we want to try real-time analysis
  mode?: 'simulation' | 'stream'
  stream?: MediaStream | null
  color?: string
  className?: string
}

export function AudioVisualizer({
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
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        audioCtxRef.current = new AudioContext()
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
      ctx.fillStyle = color

      if (mode === 'stream' && analyzerRef.current) {
        if (!isPlaying) {
          // Flat line logic for stream mode if needed, but for now just freeze/hide
          ctx.globalAlpha = 0.2
          ctx.fillRect(0, height / 2, width, 2)
          return
        }
        const bufferLength = analyzerRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyzerRef.current.getByteFrequencyData(dataArray)

        for (let i = 0; i < bars; i++) {
          const index = Math.floor(i * (bufferLength / bars))
          const value = dataArray[index] || 0
          const barHeight = (value / 255) * height
          const x = i * (barWidth + gap)
          const y = (height - barHeight) / 2
          ctx.fillRect(x, y, barWidth, barHeight)
        }
      } else {
        // Simulation Mode - Freeze logic
        const now = Date.now()
        if (isPlaying) {
          const delta = now - lastDrawTimeRef.current
          lastTimeRef.current += delta / 100
        }
        lastDrawTimeRef.current = now

        const time = lastTimeRef.current
        for (let i = 0; i < bars; i++) {
          const noise = Math.sin(time + i * 0.5) * 0.5 + 0.5
          const random = isPlaying ? Math.random() * 0.3 : 0.1
          const hPercent = noise * 0.7 + random
          const barHeight = hPercent * height * 0.8 // Max 80% height

          const x = i * (barWidth + gap)
          const y = (height - barHeight) / 2 // Centered vertically

          ctx.fillRect(x, y, barWidth, barHeight)
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
}

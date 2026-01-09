'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Spinner } from '@/components/atoms/Spinner'

interface WaveformScrubberProps {
  file: File
  initialOffset?: number
  onChange: (offset: number) => void
  width?: number
  height?: number
  color?: string
}

export function WaveformScrubber({
  file,
  initialOffset = 0,
  onChange,
  width = 600,
  height = 100,
  color = '#a855f7', // accent-purple
}: WaveformScrubberProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State for interaction
  const [isDragging, setIsDragging] = useState(false)

  // 1. Decode Audio
  useEffect(() => {
    if (!file) return

    const decode = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const arrayBuffer = await file.arrayBuffer()
        const audioContext = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)()
        const decoded = await audioContext.decodeAudioData(arrayBuffer)
        setAudioBuffer(decoded)
      } catch (err) {
        console.error('Waveform decode failed', err)
        setError('Could not load audio waveform')
      } finally {
        setIsLoading(false)
      }
    }
    decode()
  }, [file])

  // 2. Draw Waveform
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !audioBuffer) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const containerWidth = containerRef.current?.clientWidth || width
    canvas.width = containerWidth * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Clear
    ctx.clearRect(0, 0, containerWidth, height)

    // Aesthetic: Center Line (axis)
    const centerY = height / 2
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.moveTo(0, centerY)
    ctx.lineTo(containerWidth, centerY)
    ctx.stroke()

    // --- Draw Data (Fit to Width) ---
    const rawData = audioBuffer.getChannelData(0) // Mono
    const totalSamples = rawData.length
    
    // We want to map `containerWidth` pixels to `totalSamples`
    // Step size (samples per pixel)
    const step = Math.ceil(totalSamples / containerWidth)

    ctx.fillStyle = color
    ctx.strokeStyle = color

    // Draw bars
    for (let x = 0; x < containerWidth; x++) {
      let max = 0
      const startIndex = x * step
      
      // Find max in chunk
      for (let j = 0; j < step; j += 100) { // optimization skippage
        if (startIndex + j < totalSamples) {
          const val = Math.abs(rawData[startIndex + j])
          if (val > max) max = val
        }
      }

      const barHeight = Math.max(1, max * height * 0.9)
      // Centered bar
      ctx.fillRect(x, centerY - barHeight / 2, 2, barHeight) // width 2 for fuller look
    }

    // --- Draw Cursor (The Start Point) ---
    // initialOffset is in seconds.
    // Convert to pixels: (offset / duration) * width
    const duration = audioBuffer.duration
    const cursorX = (initialOffset / duration) * containerWidth

    // Draw highlighted playback region (optional: overlay before cursor?)
    // SoundCloud style usually highlights "played" part. 
    // Here we just mark the start point.

    // Cursor Line
    ctx.beginPath()
    ctx.strokeStyle = '#F43F5E' // accent-red / rose
    ctx.lineWidth = 2
    ctx.moveTo(cursorX, 0)
    ctx.lineTo(cursorX, height)
    ctx.stroke()

    // "START" Label
    ctx.fillStyle = '#F43F5E'
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    // Ensure label isn't off-screen
    const labelX = Math.min(Math.max(cursorX, 20), containerWidth - 20)
    ctx.fillText('START', labelX, 12)

    // Draw Start Time Label
    const minutes = Math.floor(initialOffset / 60)
    const seconds = (initialOffset % 60).toFixed(2)
    ctx.fillStyle = '#fff'
    ctx.fillText(`${minutes}:${seconds.padStart(5, '0')}`, labelX, height - 5)

  }, [audioBuffer, initialOffset, height, width, color])

  // Animation Loop (though purely reactive here, nice for resize/load)
  useEffect(() => {
    requestAnimationFrame(draw)
  }, [draw])


  // --- Interactions ---

  const handlePointer = (clientX: number) => {
    if (!audioBuffer || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const width = rect.width
    
    // Clamp
    const clampedX = Math.max(0, Math.min(x, width))
    
    // Convert px -> time
    // time = (x / width) * duration
    const newTime = (clampedX / width) * audioBuffer.duration
    
    onChange(newTime)
  }

  const handleStart = (clientX: number) => {
    setIsDragging(true)
    handlePointer(clientX)
  }

  const handleMove = (clientX: number) => {
    if (!isDragging) return
    handlePointer(clientX)
  }

  const handleEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black/20 rounded-lg touch-none select-none cursor-crosshair"
      style={{ height }}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Spinner size="sm" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 text-xs text-red-400">
          {error}
        </div>
      )}
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}

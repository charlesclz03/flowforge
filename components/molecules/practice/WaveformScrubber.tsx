'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Spinner } from '@/components/atoms/Spinner'

interface WaveformScrubberProps {
  file?: File
  url?: string
  initialOffset?: number
  onChange: (offset: number) => void
  onSeek?: (time: number) => void // Called when user taps to seek during playback
  width?: number
  height?: number
  color?: string
  playedColor?: string // Color for played portion
  progress?: number // Current playback progress (0-1) for playback mode
  showCuePoint?: boolean // Whether to always show the red cue point marker
}

export function WaveformScrubber({
  file,
  url,
  initialOffset = 0,
  onChange,
  onSeek,
  width = 600,
  height = 100,
  color = '#ffffff', // white - unplayed portion
  playedColor = '#a855f7', // purple for played portion
  progress, // Optional: for playback visualization
  showCuePoint = false,
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
    if (!file && !url) return

    const decode = async () => {
      setIsLoading(true)
      setError(null)
      try {
        let arrayBuffer: ArrayBuffer
        if (file) {
          arrayBuffer = await file.arrayBuffer()
        } else {
          const response = await fetch(url!)
          if (!response.ok) throw new Error('Failed to fetch audio')
          arrayBuffer = await response.arrayBuffer()
        }

        const audioContext = new (
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext
        )()
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
  }, [file, url])

  // 2. Draw Waveform with two-tone coloring (SoundCloud-style)
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

    // --- Calculate split points ---
    const duration = audioBuffer.duration
    const progressX = progress !== undefined ? progress * containerWidth : 0
    const cuePointX = (initialOffset / duration) * containerWidth

    // --- Draw Data (Fit to Width) with two-tone coloring ---
    const rawData = audioBuffer.getChannelData(0) // Mono
    const totalSamples = rawData.length

    // Step size (samples per pixel)
    const step = Math.ceil(totalSamples / containerWidth)

    // Draw bars with two colors based on position relative to splitX
    for (let x = 0; x < containerWidth; x++) {
      let max = 0
      const startIndex = x * step

      // Find max in chunk
      for (let j = 0; j < step; j += 100) {
        // optimization skippage
        if (startIndex + j < totalSamples) {
          const val = Math.abs(rawData[startIndex + j])
          if (val > max) max = val
        }
      }

      const barHeight = Math.max(1, max * height * 0.9)

      // Two-tone coloring: show playedColor for played portion when progress is provided
      if (progress !== undefined && progress > 0) {
        // Bars before progress position use playedColor (purple), after use color (white)
        ctx.fillStyle = x < progressX ? playedColor : color
      } else {
        // No playback progress - all bars use the main color (white)
        ctx.fillStyle = color
      }

      // Centered bar
      ctx.fillRect(x, centerY - barHeight / 2, 2, barHeight) // width 2 for fuller look
    }

    // --- Draw Cursor (The Start Point) ---
    // Show if progress is NOT provided OR if explicitly requested via showCuePoint
    if (progress === undefined || showCuePoint) {
      const cursorX = cuePointX

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
    }
  }, [
    audioBuffer,
    initialOffset,
    height,
    width,
    color,
    playedColor,
    progress,
    showCuePoint,
  ])

  // Animation Loop (though purely reactive here, nice for resize/load)
  useEffect(() => {
    requestAnimationFrame(draw)
  }, [draw])

  // --- Interactions ---

  const handlePointer = (clientX: number) => {
    if (!audioBuffer || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const w = rect.width

    // Clamp
    const clampedX = Math.max(0, Math.min(x, w))

    // Convert px -> time
    const newTime = (clampedX / w) * audioBuffer.duration

    // Call onSeek for playback seeking (if provided)
    if (onSeek) {
      onSeek(newTime)
    }
    // Always call onChange for cue point updates
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

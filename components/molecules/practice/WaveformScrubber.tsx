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
  
  // State for view
  // We map pixels to time.
  // Zoom level: how many pixels per second?
  const [pixelsPerSecond, setPixelsPerSecond] = useState(100)
  const [scrollX, setScrollX] = useState(0) // Scroll offset in pixels
  const [isDragging, setIsDragging] = useState(false)
  const [lastClientX, setLastClientX] = useState(0)

  // 1. Decode Audio
  useEffect(() => {
    if (!file) return

    const decode = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const arrayBuffer = await file.arrayBuffer()
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const decoded = await audioContext.decodeAudioData(arrayBuffer)
        setAudioBuffer(decoded)
        
        // Set initial scroll relative to offset
        setScrollX(initialOffset * pixelsPerSecond)
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
    canvas.width = (containerRef.current?.clientWidth || width) * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Aesthetic: Center Line
    const centerY = height / 2
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.moveTo(0, centerY)
    ctx.lineTo(canvas.width / dpr, centerY)
    ctx.stroke()

    // Draw Data
    // We only draw the visible window to optimize
    const viewWidth = canvas.width / dpr
    const leftTime = scrollX / pixelsPerSecond
    const rightTime = (scrollX + viewWidth) / pixelsPerSecond
    
    const rawData = audioBuffer.getChannelData(0) // Mono visualization
    const step = Math.ceil(rawData.length / (audioBuffer.duration * pixelsPerSecond)) // Samples per pixel essentially
    
    // Draw Peaks
    ctx.fillStyle = color
    ctx.beginPath()
    
    // Calculate start/end indices in buffer
    const startIndex = Math.floor(leftTime * audioBuffer.sampleRate)
    const endIndex = Math.min(Math.ceil(rightTime * audioBuffer.sampleRate), rawData.length)
    
    // Draw loop
    for (let i = 0; i < viewWidth; i++) {
        // Map pixel i to data index
        const timeAtPixel = leftTime + (i / pixelsPerSecond)
        const dataIndex = Math.floor(timeAtPixel * audioBuffer.sampleRate)
        
        if (dataIndex >= rawData.length) break;
        
        // Find max in chunk (downsampling)
        // Optimization: Just take a sample or max of small window
        let max = 0
        const windowSize = Math.floor(audioBuffer.sampleRate / pixelsPerSecond)
        // Check local window max
        for(let j=0; j < windowSize; j+=100) { // skip some samples for speed
             if (dataIndex + j < rawData.length) {
                 const v = Math.abs(rawData[dataIndex + j])
                 if (v > max) max = v
             }
        }
        
        const barHeight = max * height * 0.9
        // Draw centered bar
        ctx.fillRect(i, centerY - barHeight/2, 2, barHeight)
    }
    
    // Draw Center Indicator (The Cue Point)
    // Actually, user wants to "scroll on wave to pick queuepoint". 
    // Usually that means a fixed center line represents the selection.
    // Let's draw a red line at center of Viewport
    const selectionX = viewWidth / 2
    
    ctx.strokeStyle = '#F43F5E' // Red (Rose)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(selectionX, 0)
    ctx.lineTo(selectionX, height)
    ctx.stroke()
    
    // Draw Overlay Time
    const selectedTime = (scrollX + selectionX) / pixelsPerSecond
    
    // Notify Parent
    // We debounce this or do it on drag end? 
    // Doing it on drag ensures "Touch the wave... it will select"
    // But we shouldn't spam it. 
    // We'll update a Ref or check difference? 
    // For now, let's just assume parent handles updates well.

  }, [audioBuffer, scrollX, pixelsPerSecond, height, color, width])

  // Animation Loop for Smoothness
  useEffect(() => {
     requestAnimationFrame(draw)
  }, [draw])

  // 3. Interactions
  const handleStart = (clientX: number) => {
    setIsDragging(true)
    setLastClientX(clientX)
  }

  const handleMove = (clientX: number) => {
    if (!isDragging) return
    const delta = lastClientX - clientX
    setScrollX(prev => Math.max(0, prev + delta)) // Prevent negative time
    setLastClientX(clientX)
    
    // Calculate new time and fire event
    const containerWidth = containerRef.current?.clientWidth || width
    const centerOffset = containerWidth / 2
    const newTime = Math.max(0, (scrollX + delta + centerOffset) / pixelsPerSecond)
    onChange(newTime)
  }

  const handleEnd = () => {
    setIsDragging(false)
  }

  // Mouse Listeners
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX)
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX)
  const onMouseUp = () => handleEnd()
  const onMouseLeave = () => handleEnd()

  // Touch Listeners
  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX)
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX)
  const onTouchEnd = () => handleEnd()

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black/20 rounded-lg touch-none select-none cursor-grab active:cursor-grabbing"
      style={{ height }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
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
      <canvas ref={canvasRef} className="block" />
    </div>
  )
}

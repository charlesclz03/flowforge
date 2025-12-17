'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Loader2, Download, X } from 'lucide-react'

interface VideoGeneratorProps {
  audioUrl: string
  title: string
  artist: string
  onClose: () => void
}

export function VideoGenerator({ audioUrl, title, artist, onClose }: VideoGeneratorProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const paramChunks = useRef<Blob[]>([])

  const startExport = async () => {
    if (!canvasRef.current) return

    setStatus('recording')

    // Setup Audio
    const audio = new Audio(audioUrl)
    audio.crossOrigin = 'anonymous'
    audioRef.current = audio

    // Setup Audio Context for Visualizer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioContext()
    const source = ctx.createMediaElementSource(audio)
    const dest = ctx.createMediaStreamDestination()
    source.connect(dest)
    source.connect(ctx.destination)

    // Setup Canvas Recorder
    const canvasStream = canvasRef.current.captureStream(30) // 30 FPS

    // Combine Audio and Canvas Streams
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ])

    const recorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm; codecs=vp9',
    })

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        paramChunks.current.push(e.data)
      }
    }

    recorder.onstop = () => {
      setStatus('processing')
      const blob = new Blob(paramChunks.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setVideoUrl(url)
      setStatus('done')
      ctx.close()
    }

    mediaRecorderRef.current = recorder

    // Start playback and recording
    audio.play()
    recorder.start()

    // DRAWING LOOP
    const canvas = canvasRef.current
    const canvasCtx = canvas.getContext('2d')
    const analyser = ctx.createAnalyser()
    source.connect(analyser)
    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!canvasCtx || !canvas) return
      if (audio.paused && status === 'done') return

      requestAnimationFrame(draw)

      analyser.getByteFrequencyData(dataArray)

      // Background
      const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#2e1065') // dark purple
      gradient.addColorStop(1, '#000000') // black
      canvasCtx.fillStyle = gradient
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

      // Text
      canvasCtx.fillStyle = 'white'
      canvasCtx.font = 'bold 60px Inter, sans-serif'
      canvasCtx.textAlign = 'center'
      canvasCtx.fillText(title, canvas.width / 2, canvas.height / 3)

      canvasCtx.font = '40px Inter, sans-serif'
      canvasCtx.fillStyle = '#a1a1aa'
      canvasCtx.fillText(`By ${artist}`, canvas.width / 2, canvas.height / 3 + 70)

      // Visualizer (Circle)
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2 + 100
      const radius = 200

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * 1.5
        const rad = (i * 2 * Math.PI) / bufferLength
        const x = centerX + Math.cos(rad) * (radius + barHeight / 2)
        const y = centerY + Math.sin(rad) * (radius + barHeight / 2)
        const xEnd = centerX + Math.cos(rad) * (radius - barHeight / 2)
        const yEnd = centerY + Math.sin(rad) * (radius - barHeight / 2)

        canvasCtx.strokeStyle = `hsl(${(i / bufferLength) * 360 + 260}, 100%, 50%)`
        canvasCtx.lineWidth = 4
        canvasCtx.beginPath()
        canvasCtx.moveTo(x, y)
        canvasCtx.lineTo(xEnd, yEnd)
        canvasCtx.stroke()
      }

      // Brand
      canvasCtx.font = 'bold 30px sans-serif'
      canvasCtx.fillStyle = '#c026d3' // accent-pink
      canvasCtx.fillText('FLOWFORGE', canvas.width / 2, canvas.height - 50)
    }

    draw()

    // Monitor progress
    const interval = setInterval(() => {
      if (audio.duration) {
        const p = (audio.currentTime / audio.duration) * 100
        setProgress(Math.min(p, 100))
      }
      if (audio.ended) {
        clearInterval(interval)
        recorder.stop()
      }
    }, 100)

    audio.onended = () => {
      clearInterval(interval)
      if (recorder.state === 'recording') recorder.stop()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-center">Export Video</h2>

          <div className="aspect-square bg-slate-900 rounded-xl overflow-hidden relative shadow-2xl border border-white/10">
            <canvas
              ref={canvasRef}
              width={1080}
              height={1080}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            {status === 'idle' && (
              <Button onClick={startExport} className="w-full" size="lg">
                Start Video Creation
              </Button>
            )}

            {status === 'recording' && (
              <div className="space-y-2 text-center">
                <Loader2 className="animate-spin mx-auto text-accent-purple" size={32} />
                <p>Recording... {Math.round(progress)}%</p>
              </div>
            )}

            {status === 'done' && videoUrl && (
              <a href={videoUrl} download={`flowforge-${title}.webm`} className="block">
                <Button className="w-full bg-accent-green hover:bg-accent-green/80 text-black">
                  <Download size={20} className="mr-2" />
                  Download Video
                </Button>
              </a>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

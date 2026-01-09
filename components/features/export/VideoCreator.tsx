'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/atoms/Button'
import { Loader2, Download, ArrowLeft } from 'lucide-react'

interface VideoCreatorProps {
  audioUrl: string
  title: string
  artist: string
  onBack?: () => void
}

export function VideoCreator({
  audioUrl,
  title,
  artist,
  onBack,
}: VideoCreatorProps) {
  const [status, setStatus] = useState<
    'idle' | 'recording' | 'processing' | 'done'
  >('idle')
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const paramChunks = useRef<Blob[]>([])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [videoUrl])

  const startExport = async () => {
    if (!canvasRef.current) return

    setStatus('recording')
    setVideoUrl(null)
    paramChunks.current = []

    // Setup Audio
    const audio = new Audio(audioUrl)
    audio.crossOrigin = 'anonymous'
    audioRef.current = audio

    // Setup Audio Context for Visualizer
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    const ctx = new AudioContextClass()
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
    await audio.play()
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
      canvasCtx.fillText(
        `By ${artist}`,
        canvas.width / 2,
        canvas.height / 3 + 70
      )

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
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
      {/* Visualizer Preview */}
      <div className="w-full max-w-lg mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative aspect-square">
        <canvas
          ref={canvasRef}
          width={1080}
          height={1080}
          className="w-full h-full object-cover"
        />

        {/* Play Overlay if idle */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <p className="text-white font-medium bg-black/50 px-4 py-2 rounded-full border border-white/10">
              Preview
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-md mx-auto space-y-6 lg:pt-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Create Social Content</h2>
          <p className="text-text-secondary">
            Generate a high-quality visualization video for sharing on TikTok,
            Instagram Reels, or YouTube Shorts.
          </p>
        </div>

        <div className="space-y-4">
          {status === 'idle' && (
            <Button onClick={startExport} className="w-full" size="lg">
              Start Video Generation
            </Button>
          )}

          {status === 'recording' && (
            <div className="bg-white/5 rounded-xl p-6 text-center space-y-4 border border-white/10">
              <Loader2
                className="animate-spin mx-auto text-accent-purple"
                size={40}
              />
              <div>
                <h3 className="text-lg font-bold">Rendering Video...</h3>
                <p className="text-text-secondary text-sm">
                  This plays your audio to capture the visualization.
                </p>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-purple transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs font-mono">{Math.round(progress)}%</p>
            </div>
          )}

          {status === 'done' && videoUrl && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-accent-green/10 text-accent-green p-4 rounded-xl border border-accent-green/20 text-center">
                Review your video below or click download.
              </div>

              <a
                href={videoUrl}
                download={`flowforge-${title}.webm`}
                className="block"
              >
                <Button className="w-full bg-accent-green hover:bg-accent-green/80 text-black h-12 text-lg">
                  <Download size={22} className="mr-2" />
                  Download Video
                </Button>
              </a>

              <Button
                variant="ghost"
                onClick={() => setStatus('idle')}
                className="w-full"
              >
                Create Another
              </Button>
            </div>
          )}

          {onBack && (
            <Button variant="ghost" className="w-full" onClick={onBack}>
              <ArrowLeft size={18} className="mr-2" />
              Back to Recording
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

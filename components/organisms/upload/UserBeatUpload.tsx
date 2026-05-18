'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Music, Play, Square, Settings, Lock } from 'lucide-react'
import { SuccessAlert } from '@/components/molecules/feedback/SuccessAlert'
import { Spinner } from '@/components/atoms/Spinner'
import { Button } from '@/components/atoms/Button'
import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'
import { WaveformScrubber } from '@/components/molecules/practice/WaveformScrubber'
import { uploadBeatFile } from '@/lib/uploads/beat-upload-client'

interface UserBeatUploadProps {
  isPro: boolean
  onSuccess: () => void
}

export function UserBeatUpload(props: UserBeatUploadProps) {
  const { isPro, onSuccess } = props

  const [file, setFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  // Metadata State
  const [title, setTitle] = useState('')
  const [bpm, setBpm] = useState('')
  const [artist, setArtist] = useState('')
  const [label, setLabel] = useState('')
  const [genre] = useState('Freestyle')

  // Calibration State
  const [offset, setOffset] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Status State
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Premium Modal
  const [showPremium, setShowPremium] = useState(false)

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Pro Gate Check
    if (!isPro) {
      e.preventDefault()
      setShowPremium(true)
      // Reset input
      e.target.value = ''
      return
    }

    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      setAudioUrl(URL.createObjectURL(selected))
      // Auto-fill title from filename
      setTitle(selected.name.replace(/\.[^/.]+$/, ''))
      setBpm('')
      setArtist('')
      setLabel('')
      setOffset(0)
      setUploadProgress(0)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      // Start playback from the cue point (offset)
      audioRef.current.currentTime = offset
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const setStartPoint = () => {
    if (!audioRef.current) return
    setOffset(audioRef.current.currentTime)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading || !isPro) {
      if (!isPro) setShowPremium(true)
      return
    }

    if (!file || !title || !bpm) {
      setErrorMessage('Please fill in required fields')
      return
    }

    setIsLoading(true)
    setStatus('uploading')
    setUploadProgress(0)

    try {
      const upload = await uploadBeatFile({
        file,
        preferResumable: true,
        onProgress: setUploadProgress,
      })

      const res = await fetch('/api/user/beats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          bpm: parseInt(bpm),
          artistName: artist,
          label, // Include label
          genre, // Include genre again
          storageUrl: upload.publicUrl,
          offset,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save beat metadata')
      }

      setStatus('success')
      setFile(null)
      setAudioUrl(null)
      setTitle('')
      setBpm('')
      setOffset(0)
      setUploadProgress(0)
      onSuccess()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {status === 'success' && (
          <SuccessAlert
            message="Beat uploaded to your library!"
            onDismiss={() => setStatus('idle')}
          />
        )}

        {status === 'error' && errorMessage && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-200 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Input */}
          <label
            htmlFor="beat-upload-file"
            className="group relative block cursor-pointer rounded-xl border-2 border-dashed border-white/10 p-6 text-center transition-colors hover:bg-white/5 focus-within:border-accent-purple/50 focus-within:ring-2 focus-within:ring-accent-purple/70"
          >
            <input
              id="beat-upload-file"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              aria-label="Upload an audio beat file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            {/* Lock Overlay for Free Users */}
            {!isPro && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 rounded-xl pointer-events-none">
                <div className="flex flex-col items-center gap-2">
                  <Lock className="text-accent-orange" />
                  <span className="text-xs font-bold text-accent-orange uppercase tracking-wider">
                    Pro Feature
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
              {file ? (
                <>
                  <Music className="text-accent-green" size={32} />
                  <p className="text-white font-medium">{file.name}</p>
                </>
              ) : (
                <>
                  <Upload
                    className={isPro ? 'text-accent-purple' : 'text-white/20'}
                    size={32}
                  />
                  <p className="text-white font-medium">Click to Upload Beat</p>
                  <p className="text-xs text-text-tertiary">
                    MP3, WAV supported
                  </p>
                </>
              )}
            </div>
          </label>

          {file && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Calibration Player */}
              <div className="bg-background-elevated p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Settings size={14} className="text-accent-purple" />
                    Calibration
                  </h4>
                  <span className="text-xs font-mono text-accent-cyan">
                    Offset: {offset.toFixed(3)}s
                  </span>
                </div>

                <audio
                  ref={audioRef}
                  src={audioUrl!}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedMetadata={(e) =>
                    setDuration((e.target as HTMLAudioElement).duration)
                  }
                  onTimeUpdate={(e) =>
                    setCurrentTime((e.target as HTMLAudioElement).currentTime)
                  }
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={
                      isPlaying
                        ? 'Stop calibration preview'
                        : 'Play calibration preview'
                    }
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/80"
                  >
                    {isPlaying ? (
                      <Square size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} fill="currentColor" />
                    )}
                  </button>

                  <div className="flex-1 rounded overflow-hidden relative">
                    <WaveformScrubber
                      file={file}
                      initialOffset={offset}
                      onChange={(newOffset) => setOffset(newOffset)}
                      onSeek={(time) => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = time
                        }
                      }}
                      height={60}
                      showCuePoint={true}
                      progress={
                        duration > 0 ? currentTime / duration : undefined
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={setStartPoint}
                    className="px-4 py-2 text-xs font-medium bg-accent-purple/10 text-accent-purple rounded-lg hover:bg-accent-purple/20 border border-accent-purple/30"
                  >
                    Set Cue Point
                  </button>
                </div>
                <p className="text-[10px] text-text-tertiary text-center">
                  Play the beat and tap the waveform to navigate, then set the
                  cue point when the first bar drops.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-background-elevated border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    placeholder="Beat Title"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">BPM</label>
                  <input
                    type="number"
                    value={bpm}
                    onChange={(e) => setBpm(e.target.value)}
                    className="w-full bg-background-elevated border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    placeholder="e.g. 90"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">
                  Producer Name{' '}
                  <span className="text-xs text-text-tertiary">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. You or the producer"
                  className="w-full bg-background-elevated border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-purple text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">
                  Label{' '}
                  <span className="text-xs text-text-tertiary">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. My Label"
                  className="w-full bg-background-elevated border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-purple text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl font-bold"
              >
                {isLoading ? <Spinner size="sm" /> : <Upload size={18} />}
                {isLoading ? 'Uploading...' : 'Save to My Beats'}
              </Button>

              {isLoading && (
                <div className="space-y-1" role="status" aria-live="polite">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-accent-purple transition-[width]"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-[10px] font-mono text-text-tertiary">
                    {uploadProgress}% uploaded
                  </p>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      <PremiumModal
        isOpen={showPremium}
        onClose={() => setShowPremium(false)}
        trigger="beat"
      />
    </>
  )
}

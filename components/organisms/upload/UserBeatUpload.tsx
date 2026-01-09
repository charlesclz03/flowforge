'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Music, Play, Square, Settings, Lock } from 'lucide-react'
import { SuccessAlert } from '@/components/molecules/feedback/SuccessAlert'
import { Spinner } from '@/components/atoms/Spinner'
import { PremiumModal } from '@/components/molecules/monetization/PremiumModal'
import { WaveformScrubber } from '@/components/molecules/practice/WaveformScrubber'

interface UserBeatUploadProps {
  isPro: boolean
  onSuccess: () => void
}

export function UserBeatUpload({ isPro, onSuccess }: UserBeatUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  // Metadata State
  const [title, setTitle] = useState('')
  const [bpm, setBpm] = useState('')
  const [genre] = useState('Freestyle')

  // Calibration State
  const [offset, setOffset] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Status State
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const setStartPoint = () => {
    if (!audioRef.current) return
    setOffset(audioRef.current.currentTime)
  }

  const testLoop = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = offset
    audioRef.current.play()
    setIsPlaying(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPro) {
      setShowPremium(true)
      return
    }

    if (!file || !title || !bpm) {
      setErrorMessage('Please fill in required fields')
      return
    }

    setIsLoading(true)
    setStatus('uploading')

    try {
      // Step 1: Get a signed URL from our API
      const signedUrlRes = await fetch('/api/upload/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      })

      if (!signedUrlRes.ok) {
        const data = await signedUrlRes.json()
        throw new Error(data.error || 'Failed to get upload URL')
      }

      const { signedUrl, token, publicUrl } = await signedUrlRes.json()

      // Step 2: Upload directly to Supabase Storage
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'Authorization': `Bearer ${token}`,
        },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error('Direct upload failed. File may be too large or storage is full.')
      }

      // Step 3: Send metadata to our API to create the DB record
      const metadataRes = await fetch('/api/user/beats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          bpm: parseInt(bpm),
          genre,
          offset,
          storageUrl: publicUrl,
        }),
      })

      if (!metadataRes.ok) {
        const data = await metadataRes.json()
        throw new Error(data.error || 'Failed to save beat metadata')
      }

      setStatus('success')
      setFile(null)
      setAudioUrl(null)
      setTitle('')
      setBpm('')
      setOffset(0)
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
          <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative group">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
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
          </div>

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
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
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
                      height={60}
                      color="#c084fc"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={setStartPoint}
                    className="px-3 py-2 text-xs font-medium bg-accent-purple/10 text-accent-purple rounded-lg hover:bg-accent-purple/20 border border-accent-purple/30"
                  >
                    Set Start Point (Queue)
                  </button>
                  <button
                    type="button"
                    onClick={testLoop}
                    className="px-3 py-2 text-xs font-medium bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10"
                  >
                    Test Start Point
                  </button>
                </div>
                <p className="text-[10px] text-text-tertiary">
                  Play the beat and click "Set Start Point" exactly when the
                  first bar drops. This syncs your lyrics.
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-accent-purple hover:bg-accent-purple/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? <Spinner size="sm" /> : <Upload size={18} />}
                {isLoading ? 'Uploading...' : 'Save to My Beats'}
              </button>
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

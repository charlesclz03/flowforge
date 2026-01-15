'use client'

import { useState } from 'react'
import { Card } from '@/components/atoms/Card'
import { Upload, Music, Check, Crown, Unlock } from 'lucide-react'
import { SuccessAlert } from '@/components/molecules/feedback/SuccessAlert'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { Spinner } from '@/components/atoms/Spinner'
import { AppError, ErrorCodes } from '@/lib/errors'

export function AdminUploadSection() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [bpm, setBpm] = useState('')
  const [producer, setProducer] = useState('')
  const [genre, setGenre] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleTogglePremium = () => {
    setIsPremium(!isPremium)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title || !bpm || !genre || !producer) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Step 1: Get a signed URL for the 'beats' bucket
      const signedUrlRes = await fetch('/api/upload/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          bucket: 'beats', // Specify the public library bucket
        }),
      })

      if (!signedUrlRes.ok) {
        const data = await signedUrlRes.json()
        throw new Error(
          data.details || data.error || 'Failed to get upload URL'
        )
      }

      const { signedUrl, publicUrl } = await signedUrlRes.json()

      // Step 2: Upload directly to Supabase
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error(`Cloud storage upload failed (${uploadRes.status})`)
      }

      // Step 3: Register the beat in the database
      const res = await fetch('/api/admin/beats/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          bpm,
          artistName: producer,
          genre,
          isPremium,
          storageUrl: publicUrl,
          tags: '',
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(
          errorData.error ||
            `Metadata registration failed (Status: ${res.status})`
        )
      }

      setSuccess(`Beat "${title}" uploaded and published successfully!`)
      // Reset form
      setTitle('')
      setBpm('')
      setProducer('')
      setGenre('')
      setIsPremium(false)
      setFile(null)
      const fileInput = document.getElementById(
        'beat-upload'
      ) as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload beat'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      title="Admin Zone: Upload Beats"
      className="border-accent-purple/30"
      action={
        <button
          onClick={handleTogglePremium}
          className={`relative min-w-[120px] h-10 rounded-full flex items-center p-1 transition-all ${
            isPremium
              ? 'bg-accent-purple/20 border border-accent-purple/50'
              : 'bg-white/5 border border-white/10'
          }`}
          title={isPremium ? 'Premium Track' : 'Free Track'}
        >
          {/* Slider Background Indicator */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ${
              isPremium
                ? 'left-[calc(50%+2px)] bg-accent-purple'
                : 'left-1 bg-white/20'
            }`}
          />
          {/* Wrapper for content */}
          <div className="flex w-full justify-between items-center px-1 z-10">
            {/* Free Side */}
            <div
              className={`flex-1 flex justify-center transition-colors ${
                !isPremium ? 'text-white' : 'text-white/30'
              }`}
            >
              <Unlock size={16} />
            </div>

            {/* Premium Side */}
            <div
              className={`flex-1 flex justify-center transition-colors ${
                isPremium ? 'text-white' : 'text-white/30'
              }`}
            >
              <Crown size={16} />
            </div>
          </div>
        </button>
      }
    >
      <div className="space-y-6">
        <p className="text-sm text-text-secondary">
          Upload new instrumental tracks to the public library. These will be
          available to all users immediately.
        </p>
        {success && (
          <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />
        )}
        {error && (
          <ErrorAlert
            error={new AppError(error, ErrorCodes.UNKNOWN_ERROR)}
            onDismiss={() => setError(null)}
          />
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
            <input
              type="file"
              id="beat-upload"
              accept="audio/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
              {file ? (
                <>
                  <Music className="text-accent-green" size={32} />
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-xs text-text-tertiary">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="text-accent-purple" size={32} />
                  <p className="text-white font-medium">
                    Click or Drag to Upload Beat
                  </p>
                  <p className="text-xs text-text-tertiary">
                    MP3, WAV, OGG supported
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Track Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midnight Vibes"
                className="w-full bg-background-elevated border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-purple"
                required
              />
            </div>

            {/* BPM */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                BPM *
              </label>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="e.g. 90"
                className="w-full bg-background-elevated border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-purple"
                required
              />
            </div>

            {/* Producer */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Producer Name *
              </label>
              <input
                type="text"
                value={producer}
                onChange={(e) => setProducer(e.target.value)}
                placeholder="e.g. FreeStyla Originals"
                className="w-full bg-background-elevated border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-purple"
                required
              />
            </div>

            {/* Style / Genre */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Genre *
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-background-elevated border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-purple appearance-none"
                required
              >
                <option value="" disabled>
                  Select Genre
                </option>
                <option value="Hip-Hop">Hip-Hop (General)</option>
                <option value="Old School">Old School / Boom Bap</option>
                <option value="Trap">Trap</option>
                <option value="Drill">Drill</option>
                <option value="Lo-Fi">Lo-Fi</option>
                <option value="West Coast">West Coast</option>
                <option value="East Coast">East Coast</option>
                <option value="Underground">Underground</option>
                <option value="Grime">Grime</option>
                <option value="Experimental">Experimental</option>
                <option value="Afrobeat">Afrobeat</option>
                <option value="R&B">R&B</option>
                <option value="Soul">Soul</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !file}
            className="w-full flex items-center justify-center gap-2 bg-accent-purple hover:bg-accent-purple/90 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner size="sm" /> : <Check size={18} />}
            {isLoading ? 'Uploading...' : 'Publish Beat'}
          </button>
        </form>
      </div>
    </Card>
  )
}

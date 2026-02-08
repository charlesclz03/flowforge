'use client'

import { useState } from 'react'
import { Upload, Music, Disc, Type, Clock, CheckCircle } from 'lucide-react'
import { Container } from '@/components/atoms/Container'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { Button } from '@/components/atoms/Button'
import { toast } from 'react-hot-toast'

export default function AdminUploadPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    artistName: '',
    bpm: '',
    genre: 'Trap',
    difficulty: 'Medium',
    isPremium: false,
  })

  const getAudioDurationSeconds = (audioFile: File): Promise<number> =>
    new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(audioFile)
      const audio = new Audio(objectUrl)
      audio.onloadedmetadata = () => {
        resolve(Math.max(0, Math.round(audio.duration || 0)))
        URL.revokeObjectURL(objectUrl)
      }
      audio.onerror = () => {
        resolve(0)
        URL.revokeObjectURL(objectUrl)
      }
    })

  // Validate Admin (Client-side fail-fast, real check on server)
  // complicated to check session here without hook, assume Server Component redirects or API fails

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a beat file')
      return
    }

    setIsLoading(true)
    const toastId = toast.loading('Uploading beat...')

    try {
      const bpm = Number(formData.bpm)
      if (!Number.isFinite(bpm) || bpm <= 0) {
        throw new Error('Please provide a valid BPM')
      }

      const duration = await getAudioDurationSeconds(file)

      const signedUrlRes = await fetch('/api/upload/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          bucket: 'beats',
        }),
      })

      const signedUrlData = await signedUrlRes.json().catch(() => ({}))
      if (!signedUrlRes.ok || !signedUrlData?.signedUrl) {
        throw new Error(
          signedUrlData?.error || signedUrlData?.details || 'Upload failed'
        )
      }

      const uploadRes = await fetch(signedUrlData.signedUrl as string, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'audio/mpeg',
        },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error(`Cloud upload failed (${uploadRes.status})`)
      }

      const metadataRes = await fetch('/api/admin/beats/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          artistName: formData.artistName,
          bpm,
          genre: formData.genre,
          difficulty: formData.difficulty,
          isPremium: formData.isPremium,
          duration,
          storageUrl: signedUrlData.publicUrl,
          storagePath: signedUrlData.storagePath,
        }),
      })

      if (!metadataRes.ok) {
        const err = await metadataRes.json().catch(() => ({}))
        throw new Error(err.error || 'Metadata save failed')
      }

      toast.success('Beat uploaded successfully!', { id: toastId })
      setFormData({
        title: '',
        artistName: '',
        bpm: '',
        genre: 'Trap',
        difficulty: 'Medium',
        isPremium: false,
      })
      setFile(null)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      toast.error(message, { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-bottomnav">
      <AppHeader />
      <Container className="pt-24 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-header tracking-tighter flex items-center gap-3">
            <Upload className="text-accent-pink" />
            Admin Beat Upload
          </h1>
          <p className="text-text-secondary">
            Add new instrumentals to the FreeStyla library.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-background-card border border-white/5 rounded-2xl p-6 space-y-6"
        >
          {/* File Input */}
          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent-purple/50 transition-colors relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="bg-accent-purple/10 p-4 rounded-full mb-3">
              <Music className="w-8 h-8 text-accent-purple" />
            </div>
            {file ? (
              <div className="text-white font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {file.name}
              </div>
            ) : (
              <>
                <div className="text-white font-medium">
                  Click to upload audio
                </div>
                <div className="text-xs text-text-tertiary">
                  MP3 or WAV supported
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs text-text-secondary uppercase">
                Title
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-3 text-text-tertiary w-4 h-4" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Midnight City"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-accent-purple"
                />
              </div>
            </div>

            {/* Artist */}
            <div className="space-y-2">
              <label className="text-xs text-text-secondary uppercase">
                Producer
              </label>
              <div className="relative">
                <Disc className="absolute left-3 top-3 text-text-tertiary w-4 h-4" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Metro Boomin"
                  value={formData.artistName}
                  onChange={(e) =>
                    setFormData({ ...formData, artistName: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-accent-purple"
                />
              </div>
            </div>

            {/* BPM */}
            <div className="space-y-2">
              <label className="text-xs text-text-secondary uppercase">
                BPM
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-text-tertiary w-4 h-4" />
                <input
                  required
                  type="number"
                  placeholder="e.g. 140"
                  value={formData.bpm}
                  onChange={(e) =>
                    setFormData({ ...formData, bpm: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-accent-purple"
                />
              </div>
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <label className="text-xs text-text-secondary uppercase">
                Genre
              </label>
              <select
                value={formData.genre}
                onChange={(e) =>
                  setFormData({ ...formData, genre: e.target.value })
                }
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-accent-purple appearance-none"
              >
                <option value="Trap">Trap</option>
                <option value="Boombap">Boombap</option>
                <option value="Drill">Drill</option>
                <option value="Lo-fi">Lo-fi</option>
                <option value="R&B">R&B</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs text-text-secondary uppercase">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-accent-purple appearance-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* isPremium Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
              <div className="text-sm font-medium text-white">
                Premium Content
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isPremium: !formData.isPremium })
                }
                className={`w-12 h-6 rounded-full relative transition-colors ${formData.isPremium ? 'bg-accent-pink' : 'bg-white/20'}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isPremium ? 'left-7' : 'left-1'}`}
                />
              </button>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            Upload Beat
          </Button>
        </form>
      </Container>
    </div>
  )
}

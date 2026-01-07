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
      // 1. Upload File & Metadata to API
      const data = new FormData()
      data.append('file', file)
      data.append('title', formData.title)
      data.append('artistName', formData.artistName)
      data.append('bpm', formData.bpm)
      data.append('genre', formData.genre)
      data.append('difficulty', formData.difficulty)
      data.append('isPremium', formData.isPremium.toString())

      const res = await fetch('/api/admin/beats', {
        method: 'POST',
        body: data,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
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
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />
      <Container className="pt-24 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-header tracking-tighter flex items-center gap-3">
            <Upload className="text-accent-pink" />
            Admin Beat Upload
          </h1>
          <p className="text-text-secondary">
            Add new instrumentals to the FlowForge library.
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

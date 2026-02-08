'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/atoms/Button'
import {
  UploadCloud,
  Music,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Card } from '@/components/atoms/Card'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

import React from 'react'

const UploadBeatPage = (): React.JSX.Element => {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Form State
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('Triplyricist') // Default
  const [bpm, setBpm] = useState('')
  const [genre, setGenre] = useState('Trap')
  const [beatLabel, setBeatLabel] = useState('')
  const [isPremium, setIsPremium] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)

      // Get Duration
      const url = URL.createObjectURL(selected)
      const audio = new Audio(url)
      audio.onloadedmetadata = () => {
        setDuration(Math.round(audio.duration))
        URL.revokeObjectURL(url)
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setStatus('idle')

    try {
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
          title,
          artistName: artist,
          bpm: parseFloat(bpm),
          genre,
          label: beatLabel,
          isPremium,
          duration,
          storageUrl: signedUrlData.publicUrl,
          storagePath: signedUrlData.storagePath,
          difficulty: 'Medium',
        }),
      })

      if (!metadataRes.ok) {
        const metadataError = await metadataRes.json().catch(() => ({}))
        throw new Error(metadataError?.error || 'Metadata save failed')
      }

      setStatus('success')
      // Reset after delay or redirect
      setTimeout(() => router.push('/admin'), 2000)
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to upload beat.'
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-bottomnav">
      <AppHeader
        showBackButton
        customTitle="UPLOAD BEAT"
        customSubtitle="Add a new track to the library"
      />
      <div className="max-w-2xl mx-auto p-4 md:p-8 pt-8">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Selection */}
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-accent-purple/50 transition-colors">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
                id="beat-upload"
              />
              <label
                htmlFor="beat-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <div className="p-4 rounded-full bg-background-elevated">
                  {file ? (
                    <Music className="text-accent-cyan" size={32} />
                  ) : (
                    <UploadCloud className="text-text-secondary" size={32} />
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {file ? file.name : 'Click to select audio file'}
                  </p>
                  <p className="text-sm text-text-tertiary">
                    {file
                      ? `${duration}s - ${(file.size / 1024 / 1024).toFixed(2)} MB`
                      : 'MP3, WAV, OGG supported'}
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Title</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background-elevated border border-white/10 rounded-lg px-4 py-3 focus:border-accent-purple outline-none"
                  placeholder="Ex: Midnight Flow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">BPM</label>
                <input
                  required
                  type="number"
                  value={bpm}
                  onChange={(e) => setBpm(e.target.value)}
                  className="w-full bg-background-elevated border border-white/10 rounded-lg px-4 py-3 focus:border-accent-purple outline-none"
                  placeholder="Ex: 90"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Artist</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full bg-background-elevated border border-white/10 rounded-lg px-4 py-3 focus:border-accent-purple outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-background-elevated border border-white/10 rounded-lg px-4 py-3 focus:border-accent-purple outline-none"
                >
                  <option>Trap</option>
                  <option>Boom Bap</option>
                  <option>Drill</option>
                  <option>Lo-Fi</option>
                  <option>R&B</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Label</label>
                <input
                  type="text"
                  value={beatLabel}
                  onChange={(e) => setBeatLabel(e.target.value)}
                  className="w-full bg-background-elevated border border-white/10 rounded-lg px-4 py-3 focus:border-accent-purple outline-none"
                  placeholder="Ex: FreeStyla Originals"
                />
              </div>
              <div className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  id="premium"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="w-5 h-5 rounded border-white/10 bg-background-elevated text-accent-gold focus:ring-accent-gold"
                />
                <label
                  htmlFor="premium"
                  className="text-sm font-medium cursor-pointer"
                >
                  Premium Only (Pro)
                </label>
              </div>
            </div>

            {status === 'error' && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
                <AlertCircle size={20} />
                {errorMessage}
              </div>
            )}

            {status === 'success' && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-2">
                <CheckCircle2 size={20} />
                Beat uploaded successfully! Redirecting...
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 text-lg"
              disabled={!file || isUploading || status === 'success'}
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Upload Beat'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default UploadBeatPage

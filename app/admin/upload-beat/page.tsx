'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/constants/auth'
import { Container } from '@/components/atoms/Container'
import { Button } from '@/components/atoms/Button'

import { toast } from 'react-hot-toast'
import { Music, Upload, CheckCircle2 } from 'lucide-react'

export default function AdminUploadPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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

  if (!session || !isAdmin(session.user?.role)) {
    return (
      <Container size="sm" className="py-20 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="mt-4 text-text-secondary">
          You are not authorized to view this page.
        </p>
        <Button
          onClick={() => router.push('/')}
          className="mt-6"
          variant="secondary"
        >
          Go Home
        </Button>
      </Container>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      const audioFile = formData.get('audio')
      if (!(audioFile instanceof File) || audioFile.size <= 0) {
        throw new Error('Audio file is required')
      }

      const title = String(formData.get('title') || '').trim()
      const artistName = String(formData.get('producer') || '').trim()
      const genre = String(formData.get('genre') || 'Trap').trim()
      const difficulty = String(formData.get('difficulty') || 'Medium').trim()
      const label = String(formData.get('mood') || '').trim()
      const bpm = Number(formData.get('bpm'))

      if (!title || !artistName || !Number.isFinite(bpm) || bpm <= 0) {
        throw new Error('Missing required fields (title, producer, bpm)')
      }

      const duration = await getAudioDurationSeconds(audioFile)

      const signedUrlRes = await fetch('/api/upload/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: audioFile.name,
          contentType: audioFile.type,
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
          'Content-Type': audioFile.type || 'audio/mpeg',
        },
        body: audioFile,
      })

      if (!uploadRes.ok) {
        throw new Error(`Cloud upload failed (${uploadRes.status})`)
      }

      const metadataRes = await fetch('/api/admin/beats/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          artistName,
          bpm,
          genre,
          difficulty,
          label,
          isPremium: false,
          duration,
          storageUrl: signedUrlData.publicUrl,
          storagePath: signedUrlData.storagePath,
        }),
      })

      if (!metadataRes.ok) {
        const err = await metadataRes.json().catch(() => ({}))
        throw new Error(err.error || 'Metadata save failed')
      }

      toast.custom(() => (
        <div className="bg-black/90 border border-accent-purple p-4 rounded-xl flex items-center gap-4">
          <CheckCircle2 className="text-accent-green" />
          <div>
            <p className="font-bold text-white">Beat Uploaded!</p>
            <p className="text-sm text-text-secondary">
              It's now live on FreeStyla.
            </p>
          </div>
        </div>
      ))

      e.currentTarget.reset()
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error('Upload failed: ' + err.message)
      } else {
        toast.error('Upload failed: Unknown error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="sm" className="py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold bg-gradient-purple bg-clip-text text-transparent inline-flex items-center gap-3">
          <Music className="text-accent-purple" />
          Admin Beat Upload
        </h1>
        <p className="text-text-secondary mt-2">
          Add fresh heat to the library.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Cover Image (Optional)
          </label>
          <input
            type="file"
            name="cover"
            accept="image/*"
            className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-purple/20 file:text-accent-purple hover:file:bg-accent-purple/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Audio File (MP3/WAV)
          </label>
          <input
            required
            type="file"
            name="audio"
            accept="audio/*"
            className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-purple/20 file:text-accent-purple hover:file:bg-accent-purple/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Title
            </label>
            <input
              required
              name="title"
              placeholder="E.g. Neon Nights"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent-purple outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Producer
            </label>
            <input
              required
              name="producer"
              placeholder="E.g. Metro Boomin"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent-purple outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">BPM</label>
            <input
              required
              type="number"
              name="bpm"
              placeholder="e.g. 140"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent-purple outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Genre
            </label>
            <select
              name="genre"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent-purple outline-none"
            >
              <option value="Trap">Trap</option>
              <option value="Boom Bap">Boom Bap</option>
              <option value="Drill">Drill</option>
              <option value="Lo-Fi">Lo-Fi</option>
              <option value="R&B">R&B</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Difficulty
            </label>
            <select
              name="difficulty"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent-purple outline-none"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Vibe / Tags
          </label>
          <input
            name="mood"
            placeholder="Aggressive, Dark, Hype"
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-accent-purple outline-none"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload to Library'}
          {!loading && <Upload size={18} className="ml-2" />}
        </Button>
      </form>
    </Container>
  )
}

'use client'

import { useState, useRef } from 'react'
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { Camera, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  user: {
    username?: string | null
    bio?: string | null
    image?: string | null
  }
  onSuccess: () => void
}

export function EditProfileDialog({ isOpen, onClose, user, onSuccess }: EditProfileDialogProps) {
  const [username, setUsername] = useState(user.username || '')
  const [bio, setBio] = useState(user.bio || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.image || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('bio', bio)
      if (avatarFile) {
        formData.append('image', avatarFile)
      }

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar (Read Only) */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Avatar Preview"
                fill
                className="object-cover group-hover:opacity-75 transition-opacity"
              />
            ) : (
              <div className="w-full h-full bg-accent-purple/20 flex items-center justify-center text-accent-purple font-bold text-2xl group-hover:bg-accent-purple/30 transition-colors">
                {username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <Camera className="text-white w-8 h-8" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <p className="text-xs text-text-tertiary">Tap to change avatar</p>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-purple/50 transition-colors"
              placeholder="Enter username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-purple/50 transition-colors resize-none h-24"
              placeholder="Tell us about your flow..."
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full py-3" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

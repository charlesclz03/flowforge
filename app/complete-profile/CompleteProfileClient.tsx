'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2, Camera } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { Button } from '@/components/atoms/Button'
import { useAsyncValidation } from '@/hooks/useAsyncValidation'
import { trackEvent } from '@/lib/analytics/track'

interface CompleteProfileClientProps {
  nextPath: string
  user: {
    name: string | null
    username: string
    bio: string
    image: string | null
  }
}

interface UsernameAvailabilityPayload {
  available: boolean
  normalized: string
  error?: string | null
}

async function validateUsername(
  username: string
): Promise<UsernameAvailabilityPayload> {
  const res = await fetch(
    `/api/user/profile/username-availability?username=${encodeURIComponent(username)}`,
    { cache: 'no-store' }
  )

  const data = (await res.json()) as UsernameAvailabilityPayload
  if (!res.ok) {
    throw new Error(data.error || 'Unable to validate username right now.')
  }

  return data
}

export default function CompleteProfileClient({
  nextPath,
  user,
}: CompleteProfileClientProps) {
  const router = useRouter()
  const { update } = useSession()
  const [username, setUsername] = useState(user.username || '')
  const [bio, setBio] = useState(user.bio || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.image || null
  )
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const usernameCheck = useAsyncValidation(validateUsername)

  const usernameStatus = useMemo(() => {
    if (!username.trim()) return null
    if (usernameCheck.loading) return 'Checking username...'
    if (usernameCheck.error) return usernameCheck.error
    if (usernameCheck.result?.available) {
      return `Available as @${usernameCheck.result.normalized}`
    }
    return null
  }, [
    username,
    usernameCheck.error,
    usernameCheck.loading,
    usernameCheck.result,
  ])

  useEffect(() => {
    if (!username.trim()) {
      usernameCheck.reset()
      return
    }

    const timeoutId = window.setTimeout(() => {
      void usernameCheck.validate(username)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [username, usernameCheck])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setAvatarFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (usernameCheck.error) {
      setFormError(usernameCheck.error)
      return
    }

    if (usernameCheck.result && !usernameCheck.result.available) {
      setFormError(
        usernameCheck.result.error || 'That username is unavailable.'
      )
      return
    }

    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('bio', bio)
      formData.append('completeProfile', 'true')
      if (avatarFile) {
        formData.append('image', avatarFile)
      }

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        body: formData,
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Unable to complete profile setup.')
      }

      // New account finished onboarding — fire the signup conversion event so
      // GTM/analytics can measure signups, not just checkouts (GA4 `sign_up`).
      trackEvent('sign_up', { method: 'google' })

      await update()
      toast.success('Profile setup complete')
      router.replace(nextPath)
      router.refresh()
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to complete profile setup.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <OnboardingLayout
      customTitle="CLAIM YOUR PROFILE"
      customSubtitle="Set your handle before you enter the booth"
      showBackButton={false}
      showSettings={false}
      showProgress={false}
    >
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
        >
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              Finish Your Setup
            </h2>
            <p className="text-sm text-text-secondary">
              Pick your handle now. After this step, you&apos;ll still be able
              to edit your bio and avatar later.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-white/15 bg-white/5"
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Profile preview"
                  fill
                  className="object-cover transition-opacity group-hover:opacity-80"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-accent-purple/20 text-2xl font-black text-accent-purple">
                  {(user.name || username || 'U').slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-7 w-7 text-white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-text-tertiary">
              Tap to add or change your avatar
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Username
            </label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="your-handle"
              className="w-full rounded-xl border border-white/10 bg-background/50 px-4 py-3 text-white outline-none transition-colors focus:border-accent-purple/50"
            />
            {usernameStatus && (
              <p
                className={`text-xs ${
                  usernameCheck.error ? 'text-red-400' : 'text-text-tertiary'
                }`}
              >
                {usernameStatus}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Tell the world about your flow..."
              className="h-28 w-full resize-none rounded-xl border border-white/10 bg-background/50 px-4 py-3 text-white outline-none transition-colors focus:border-accent-purple/50"
            />
          </div>

          {formError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            disabled={isSaving || usernameCheck.loading}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Profile...
              </>
            ) : (
              'Enter FreeStyla'
            )}
          </Button>
        </form>
      </div>
    </OnboardingLayout>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Edit2 } from 'lucide-react'
import { EditProfileDialog } from '@/components/organisms/profile/EditProfileDialog'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ProfileOwnerControlsProps {
  user: {
    username?: string | null
    bio?: string | null
    image?: string | null
    name?: string | null
  }
}

export function ProfileOwnerControls({ user }: ProfileOwnerControlsProps) {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const { update } = useSession()
  const router = useRouter()

  const handleSuccess = async () => {
    await update()
    router.refresh() // Refresh server components to show new data
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditProfileOpen(true)}
        className="text-text-secondary hover:text-white"
        aria-label="Edit Profile"
      >
        <Edit2 size={16} />
        <span className="ml-2 hidden sm:inline">Edit Profile</span>
      </Button>

      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onSuccess={handleSuccess}
      />
    </>
  )
}

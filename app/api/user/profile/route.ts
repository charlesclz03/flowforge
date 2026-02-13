import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { createServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import {
  AVATAR_MAX_BYTES,
  avatarExtensionForMimeType,
  detectAvatarMimeType,
  isAllowedAvatarMimeType,
  isValidAvatarFileName,
} from '@/lib/security/avatar'

export async function PATCH(request: Request) {
  try {
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    })

    const formData = await request.formData()
    const username = formData.get('username') as string
    const bio = formData.get('bio') as string
    const imageFile = formData.get('image') as File | null

    const updateData: Record<string, string> = {}
    if (username) updateData.username = username
    if (bio !== null) updateData.bio = bio // Allow empty string to clear bio

    // Handle Image Upload
    let newAvatarStoragePath: string | null = null
    if (imageFile) {
      if (imageFile.size <= 0) {
        return NextResponse.json(
          { error: 'Avatar file is empty' },
          { status: 400 }
        )
      }

      if (imageFile.size > AVATAR_MAX_BYTES) {
        return NextResponse.json(
          { error: 'Avatar file is too large (max 5MB)' },
          { status: 413 }
        )
      }

      const declaredMimeType = imageFile.type.trim().toLowerCase()
      if (declaredMimeType && !isAllowedAvatarMimeType(declaredMimeType)) {
        return NextResponse.json(
          {
            error:
              'Unsupported avatar format. Allowed: image/jpeg, image/png, image/webp',
          },
          { status: 400 }
        )
      }

      const imageBytes = new Uint8Array(await imageFile.arrayBuffer())
      const detectedMimeType = detectAvatarMimeType(imageBytes)
      if (!detectedMimeType) {
        return NextResponse.json(
          { error: 'Invalid avatar content' },
          { status: 400 }
        )
      }

      if (declaredMimeType && declaredMimeType !== detectedMimeType) {
        return NextResponse.json(
          { error: 'Avatar MIME type does not match file content' },
          { status: 400 }
        )
      }

      const supabase = createServerClient()
      const fileExt = avatarExtensionForMimeType(detectedMimeType)
      const fileName = `${randomUUID()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      newAvatarStoragePath = filePath

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Use dedicated 'avatars' bucket or folder in existing
        .upload(filePath, imageBytes, {
          contentType: detectedMimeType,
          upsert: false,
          cacheControl: '31536000',
        })

      if (uploadError) {
        console.error('Avatar upload error:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload avatar' },
          { status: 500 }
        )
      }

      // We store the PROXY URL, not Supabase URL, to keep it private-read
      // Proxy URL: /api/avatars/filename.png
      updateData.image = `/api/avatars/${fileName}`
    }

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    const previousAvatar = currentUser?.image || ''
    if (
      newAvatarStoragePath &&
      previousAvatar.startsWith('/api/avatars/') &&
      !previousAvatar.includes('..')
    ) {
      const previousFileName = decodeURIComponent(
        previousAvatar.replace('/api/avatars/', '')
      )
      if (isValidAvatarFileName(previousFileName)) {
        const supabase = createServerClient()
        await supabase.storage
          .from('avatars')
          .remove([`avatars/${previousFileName}`])
      }
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

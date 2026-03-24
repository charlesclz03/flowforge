import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { createServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import {
  isUsernameAvailable,
  validateUsernameCandidate,
} from '@/lib/auth/username'
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
    // 1 & 2. Fetch current user and parse formData concurrently
    const [currentUser, formData] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          image: true,
          username: true,
          profileSetupCompletedAt: true,
        },
      }),
      request.formData(),
    ])

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const usernameValue = formData.get('username')
    const username =
      typeof usernameValue === 'string' ? usernameValue.trim() : ''
    const bioValue = formData.get('bio')
    const bio = typeof bioValue === 'string' ? bioValue : null
    const imageFile = formData.get('image') as File | null
    const completeProfile =
      String(formData.get('completeProfile') || '').toLowerCase() === 'true'

    const updateData: Record<string, string | Date> = {}
    if (username) {
      if (
        currentUser.profileSetupCompletedAt &&
        !completeProfile &&
        username !== currentUser.username
      ) {
        return NextResponse.json(
          { error: 'Username can only be changed during profile setup.' },
          { status: 403 }
        )
      }

      const validation = validateUsernameCandidate(username)
      if (validation.error) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      const nextUsername = validation.normalized
      if (nextUsername !== currentUser.username) {
        const available = await isUsernameAvailable(
          nextUsername,
          session.user.id
        )
        if (!available) {
          return NextResponse.json(
            { error: 'That username is already taken.' },
            { status: 409 }
          )
        }
      }

      updateData.username = nextUsername
    }
    if (bio !== null) updateData.bio = bio // Allow empty string to clear bio

    if (completeProfile) {
      const finalUsername =
        typeof updateData.username === 'string'
          ? updateData.username
          : currentUser.username

      const validation = validateUsernameCandidate(finalUsername || '')
      if (validation.error) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      updateData.profileSetupCompletedAt =
        currentUser.profileSetupCompletedAt || new Date()
    }

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
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'That username is already taken.' },
        { status: 409 }
      )
    }

    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

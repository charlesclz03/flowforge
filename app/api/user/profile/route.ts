import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { createServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  try {
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const username = formData.get('username') as string
    const bio = formData.get('bio') as string
    const imageFile = formData.get('image') as File | null

    const updateData: Record<string, string> = {}
    if (username) updateData.username = username
    if (bio !== null) updateData.bio = bio // Allow empty string to clear bio

    // Handle Image Upload
    if (imageFile) {
      const supabase = createServerClient()
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Use dedicated 'avatars' bucket or folder in existing
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: true,
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

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

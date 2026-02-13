import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import {
  avatarExtensionForMimeType,
  detectAvatarMimeType,
  isValidAvatarFileName,
} from '@/lib/security/avatar'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    if (!isValidAvatarFileName(filename)) {
      return new NextResponse('Invalid avatar filename', { status: 400 })
    }

    const supabase = createServerClient()

    // Using 'avatars' bucket as defined in upload route
    const { data, error } = await supabase.storage
      .from('avatars')
      .download(`avatars/${filename}`)

    if (error || !data) {
      console.error('Avatar download error', error)
      return new NextResponse('Not found', { status: 404 })
    }
    const bytes = new Uint8Array(await data.arrayBuffer())
    const detectedMimeType = detectAvatarMimeType(bytes)

    if (!detectedMimeType) {
      return new NextResponse('Unsupported avatar format', { status: 415 })
    }

    const extension = avatarExtensionForMimeType(detectedMimeType)

    return new NextResponse(bytes, {
      headers: {
        'Content-Type': detectedMimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': `inline; filename="avatar.${extension}"`,
      },
    })
  } catch (e) {
    console.error('Avatar proxy error', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

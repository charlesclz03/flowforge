import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename
    const supabase = createServerClient()

    // Using 'avatars' bucket as defined in upload route
    const { data, error } = await supabase.storage.from('avatars').download(`avatars/${filename}`)

    if (error || !data) {
      console.error('Avatar download error', error)
      return new NextResponse('Not found', { status: 404 })
    }

    return new NextResponse(data, {
      headers: {
        'Content-Type': data.type || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e) {
    console.error('Avatar proxy error', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

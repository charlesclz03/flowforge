import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

/**
 * Generates a signed URL for direct-to-Supabase uploads.
 * This bypasses the Vercel serverless function body size limit.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileName, contentType } = await req.json()

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'Missing fileName or contentType' },
        { status: 400 }
      )
    }

    // Initialize Supabase with service role key for signed URL generation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate a unique file path
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
    const storagePath = `users/${session.user.id}/${Date.now()}-${safeName}`

    // Create a signed URL valid for 5 minutes (300 seconds)
    const { data, error } = await supabase.storage
      .from('audio')
      .createSignedUploadUrl(storagePath)

    if (error) {
      console.error('Signed URL Error:', error)
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      )
    }

    // Also return the public URL for after the upload completes
    const { data: publicData } = supabase.storage
      .from('audio')
      .getPublicUrl(storagePath)

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      publicUrl: publicData.publicUrl,
      storagePath,
    })
  } catch (error) {
    console.error('Signed URL Generation Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

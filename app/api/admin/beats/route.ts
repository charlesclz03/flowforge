import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // 1. Auth Check
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Admin Check
    const adminEmail = process.env.ADMIN_EMAIL
    if (session.user.email !== adminEmail) {
      return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 })
    }

    // 3. Parse Form Data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const artistName = formData.get('artistName') as string
    const bpm = parseInt(formData.get('bpm') as string)
    const genre = formData.get('genre') as string
    const difficulty = formData.get('difficulty') as string
    const isPremium = formData.get('isPremium') === 'true'
    const duration = parseInt(formData.get('duration') as string) || 0

    if (!file || !title || !artistName || !bpm) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 4. Upload to Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin bypass
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${title.toLowerCase().replace(/\s+/g, '-')}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage.from('beats').upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // 5. Get Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('beats').getPublicUrl(fileName)

    // 6. Save to DB
    const beat = await prisma.beat.create({
      data: {
        title,
        artistName,
        bpm,
        genre,
        difficulty,
        isPremium,
        storageUrl: publicUrl,
        duration: duration,
      },
    })

    return NextResponse.json({ success: true, beat })
  } catch (error: unknown) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

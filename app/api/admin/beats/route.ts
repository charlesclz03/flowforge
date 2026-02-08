import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { verifySuperAdmin } from '@/lib/auth/admin'

export async function POST(req: NextRequest) {
  try {
    // 1. Auth + Admin Check
    await verifySuperAdmin()

    // 2. Parse Form Data
    const formData = await req.formData()
    const file = (formData.get('file') || formData.get('audio')) as File
    const title = formData.get('title') as string
    const artistName = formData.get('artistName') as string
    const bpm = parseInt(formData.get('bpm') as string)
    const genre = formData.get('genre') as string
    const difficulty = ((formData.get('difficulty') as string) || 'Medium')
      .trim()
      .slice(0, 20)
    const label = ((formData.get('label') as string) || '').trim()
    const isPremium = formData.get('isPremium') === 'true'
    const duration = parseInt(formData.get('duration') as string) || 0

    if (!file || !title || !artistName || !bpm) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 3. Upload to Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin bypass
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${title.toLowerCase().replace(/\s+/g, '-')}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('beats')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // 4. Get Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('beats').getPublicUrl(fileName)

    // 5. Save to DB
    const beat = await prisma.beat.create({
      data: {
        title,
        artistName,
        bpm,
        genre,
        label: label || null,
        difficulty,
        isPremium,
        storageUrl: publicUrl,
        duration: duration,
      },
    })

    return NextResponse.json({ success: true, beat })
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

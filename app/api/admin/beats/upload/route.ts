import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use Service Role Key for Admin Uploads!
const supabase = createClient(supabaseUrl, supabaseKey)

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // 1. Authorization Check
    if (!session || session.user?.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const formData = await req.formData()
    // Align keys with Client
    const audioFile = formData.get('file') as File
    const title = formData.get('title') as string
    const bpm = parseInt(formData.get('bpm') as string)
    const artistName = formData.get('artistName') as string
    const genre = formData.get('genre') as string
    const difficulty = formData.get('difficulty') as string // Sent as string
    const isPremium = formData.get('isPremium') === 'true'
    const tagsRaw = formData.get('tags') as string

    if (!audioFile || !title || !bpm) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 2. Upload to Supabase Storage
    const fileExt = audioFile.name.split('.').pop()
    const fileName = `beats/${Date.now()}-${title.replace(/\s+/g, '-').toLowerCase()}.${fileExt}`

    // Convert File to Buffer for Supabase upload (Node environment)
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('audio') // Ensure bucket exists 'audio' or 'beats'
      .upload(fileName, buffer, {
        contentType: audioFile.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload audio file' }, { status: 500 })
    }

    // 3. Get Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('audio').getPublicUrl(fileName)

    const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : []

    // 4. Create Database Record
    const beat = await prisma.beat.create({
      data: {
        title,
        bpm,
        artistName: artistName || 'Unknown Producer',
        genre: genre || 'Freestyle',
        difficulty: difficulty || 'Medium',
        storageUrl: publicUrl,
        isPremium,
        duration: 0, // Placeholder
        tags: tags,
      },
    })

    return NextResponse.json({ success: true, beat })
  } catch (error) {
    console.error('Admin Beat Upload Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

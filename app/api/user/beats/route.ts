import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  // Lazy init
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Pro Check
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    const isPro =
      user?.subscriptionStatus === 'active' ||
      user?.subscriptionStatus === 'trialing'

    // Strict Pro Gate on Backend
    if (!isPro && user?.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Pro subscription required for uploads' },
        { status: 403 }
      )
    }

    // Quota Check (Optional - prevent abuse)
    const count = await prisma.beat.count({
      where: { uploaderId: session.user.id },
    })
    if (count >= 50 && user?.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Beat storage limit reached (50 beats)' },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const bpm = parseInt(formData.get('bpm') as string)
    const genre = formData.get('genre') as string
    const offset = parseFloat(formData.get('offset') as string) || 0

    if (!file || !title || !bpm) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Upload to Supabase 'audio' bucket
    const fileExt = file.name.split('.').pop()
    const fileName = `users/${session.user.id}/${Date.now()}-${title.replace(/\s+/g, '-').toLowerCase()}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, buffer, {
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload audio' },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('audio').getPublicUrl(fileName)

    // Create Beat Record
    const beat = await prisma.beat.create({
      data: {
        title,
        bpm,
        genre: genre || 'Freestyle',
        storageUrl: publicUrl,
        isPremium: false, // User beats are private/free for them? Or just use isPremium false to allow access
        artistName: session.user.name || 'Me',
        uploaderId: session.user.id,
        offset: offset,
        difficulty: 'Medium',
        tags: ['user-upload'],
      },
    })

    return NextResponse.json({ success: true, beat })
  } catch (error) {
    console.error('User Upload Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET(_req: NextRequest) {
  // Lazy init (not strictly needed for DB only, but good practice if we expand)
  // actually GET only uses prisma, so we don't need supabase here.
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const beats = await prisma.beat.findMany({
      where: {
        uploaderId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ beats })
  } catch (error) {
    console.error('Fetch User Beats Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch beats' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Initialize Supabase Client
export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // 1. Authorization Check
    if (session?.user?.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const {
      title,
      bpm,
      artistName,
      genre,
      storageUrl,
      tags: tagsRaw,
      isPremium,
    } = await req.json()

    if (!storageUrl || !title || !bpm) {
      return NextResponse.json(
        { error: 'Missing required fields (title, bpm, storageUrl)' },
        { status: 400 }
      )
    }

    const tags = tagsRaw
      ? typeof tagsRaw === 'string'
        ? tagsRaw
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : tagsRaw
      : []

    // 2. Create Database Record
    const beat = await prisma.beat.create({
      data: {
        title,
        bpm: parseInt(bpm),
        artistName: artistName || 'Unknown Producer',
        genre: genre || 'Freestyle',
        difficulty: 'Medium',
        storageUrl,
        isPremium: !!isPremium, // Use provided value or false
        duration: 0, // Placeholder
        tags: tags,
      },
    })

    return NextResponse.json({ success: true, beat })
  } catch (error) {
    console.error('Admin Beat Upload Metadata Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

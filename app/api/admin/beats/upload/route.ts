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
      label: labelRaw,
      duration: durationRaw,
      difficulty: difficultyRaw,
      tags: tagsRaw,
      isPremium,
    } = await req.json()

    const parsedBpm =
      typeof bpm === 'number' ? Math.round(bpm) : parseInt(String(bpm), 10)
    const parsedDuration =
      typeof durationRaw === 'number'
        ? Math.max(0, Math.round(durationRaw))
        : Math.max(0, parseInt(String(durationRaw ?? 0), 10) || 0)
    const difficulty =
      typeof difficultyRaw === 'string' && difficultyRaw.trim()
        ? difficultyRaw.trim().slice(0, 20)
        : 'Medium'
    const label =
      typeof labelRaw === 'string' ? labelRaw.trim().slice(0, 80) : ''

    if (
      !storageUrl ||
      !title ||
      !Number.isFinite(parsedBpm) ||
      parsedBpm <= 0
    ) {
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
        bpm: parsedBpm,
        artistName: artistName || 'Unknown Producer',
        genre: genre || 'Freestyle',
        label: label || null,
        difficulty,
        storageUrl,
        isPremium: !!isPremium, // Use provided value or false
        duration: parsedDuration,
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

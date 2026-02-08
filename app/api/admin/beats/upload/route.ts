import { NextRequest, NextResponse } from 'next/server'

import { verifySuperAdmin } from '@/lib/auth/admin'
import { prisma } from '@/lib/prisma'

// Initialize Supabase Client
export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization Check
    await verifySuperAdmin()

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
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    console.error('Admin Beat Upload Metadata Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

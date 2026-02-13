import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Increase body size limit for file uploads (default is 4.5MB, beats can be larger)
// This requires Vercel Pro plan for limits > 4.5MB. For Hobby, consider direct-to-Supabase upload.
export const runtime = 'nodejs'
export const maxDuration = 60 // Allow longer processing time for file uploads

const createUserBeatSchema = z.object({
  title: z.string().trim().min(1).max(120),
  bpm: z.coerce.number().finite().gt(0).lte(300),
  genre: z.string().trim().max(50).optional().nullable(),
  // Allow full-track cue points for long user uploads (not just first 30s).
  offset: z.coerce.number().finite().min(0).max(3600).default(0),
  storageUrl: z
    .string()
    .trim()
    .min(1)
    .max(2048)
    .refine(
      (value) =>
        value.startsWith('/') ||
        value.startsWith('http://') ||
        value.startsWith('https://'),
      'Invalid storageUrl'
    ),
})

export async function POST(req: NextRequest) {
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
      user?.subscriptionStatus === 'trialing' ||
      user?.role === 'SUPERADMIN' ||
      session.user.role === 'SUPERADMIN'

    // Strict Pro Gate on Backend
    if (!isPro) {
      console.warn(
        `[UPLOAD_GATE] Access denied for user ${session.user.id}. Role: ${user?.role}, Status: ${user?.subscriptionStatus}`
      )
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

    // Now expects JSON body with storageUrl (file already uploaded to Supabase)
    const body = await req.json()
    const parseResult = createUserBeatSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid beat metadata payload',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { title, bpm, genre, offset, storageUrl } = parseResult.data

    // Create Beat Record
    const beat = await prisma.beat.create({
      data: {
        title,
        bpm,
        genre: genre || 'Freestyle',
        storageUrl,
        isPremium: false,
        artistName: session.user.name || 'Me',
        uploaderId: session.user.id,
        offset,
        difficulty: 'Medium',
        tags: ['user-upload'],
      },
    })

    return NextResponse.json({ success: true, beat })
  } catch (error) {
    console.error('User Beat Metadata Error:', error)
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

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSessionWithUserId } from '@/lib/auth/server'

export async function POST(request: Request) {
  try {
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { duelId, votedForId } = await request.json()

    if (!duelId || !votedForId) {
      return NextResponse.json({ error: 'Missing duelId or votedForId' }, { status: 400 })
    }

    // Check if user already voted
    const existingVote = await prisma.duelVote.findUnique({
      where: {
        voterId_duelId: {
          voterId: session.user.id,
          duelId,
        },
      },
    })

    if (existingVote) {
      // Optional: Allow changing vote? For MVP, let's say no, or just update it.
      // Let's create new if not exists, or error.
      return NextResponse.json({ error: 'Already voted' }, { status: 400 })
    }

    // Create vote
    await prisma.duelVote.create({
      data: {
        voterId: session.user.id,
        duelId,
        votedForId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vote Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { duelId, votedForId } = await req.json()

    // Validation: Prevent duplicate voting
    const existingVote = await prisma.duelVote.findUnique({
      where: {
        voterId_duelId: {
          voterId: session.user.id,
          duelId: duelId,
        },
      },
    })

    if (existingVote) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 })
    }

    // Record Vote
    await prisma.duelVote.create({
      data: {
        duelId,
        voterId: session.user.id,
        votedForId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DUEL_VOTE]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

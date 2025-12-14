import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: duelId } = params // The parent session ID (the context of the duel)
    const json = await request.json()
    const { votedForId } = json // The session ID they are voting FOR

    if (!votedForId) {
      return NextResponse.json({ error: 'Missing votedForId' }, { status: 400 })
    }

    // 1. Verify the duel exists (parent session)
    // Actually, "duelId" is the ID of the shared context.
    // In our simplified model, the "Parent" session IS the duel context.
    const parentSession = await prisma.freestyleSession.findUnique({
      where: { id: duelId },
    })

    if (!parentSession) {
      return NextResponse.json({ error: 'Duel not found' }, { status: 404 })
    }

    // 2. Prevent voting for yourself? (Optional, ethical check)
    // Not critical for MVP but good practice.

    // 3. Create or Update Vote
    // We use upsert to allow changing votes? Or create to enforce one-time?
    // Schema has @@unique([voterId, duelId]), so one vote per duel context.

    const vote = await prisma.duelVote.upsert({
      where: {
        voterId_duelId: {
          voterId: session.user.id,
          duelId: duelId,
        },
      },
      update: {
        votedForId: votedForId,
      },
      create: {
        duelId: duelId,
        voterId: session.user.id,
        votedForId: votedForId,
      },
    })

    return NextResponse.json({ success: true, vote })
  } catch (error) {
    console.error('Voting error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const { parentId } = json

    if (!parentId) {
      return NextResponse.json({ error: 'Missing parent session ID' }, { status: 400 })
    }

    // Verify parent session exists
    const parentSession = await prisma.freestyleSession.findUnique({
      where: { id: parentId },
      include: { beat: true },
    })

    if (!parentSession) {
      return NextResponse.json({ error: 'Challenge session not found' }, { status: 404 })
    }

    // Return the session details to the challenger so they can record their response
    // The actual "Duel" is created when the challenger saves their recording with `parentId` set.
    // This endpoint effectively validates the challenge link/ID.

    return NextResponse.json({
      success: true,
      challenge: {
        id: parentSession.id,
        title: parentSession.title,
        beat: parentSession.beat,
        user: parentSession.userId, // Should probably expand user details if needed
        frequency: parentSession.frequency,
        difficulty: parentSession.difficulty,
      },
    })
  } catch (error) {
    console.error('Duel creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

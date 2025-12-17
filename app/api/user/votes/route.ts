import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const votes = await prisma.duelVote.findMany({
      where: {
        voterId: session.user.id,
      },
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        winner: {
          select: {
            title: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        duel: {
          select: {
            title: true,
          },
        },
      },
    })

    return NextResponse.json({ votes })
  } catch (error) {
    console.error('Error fetching votes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

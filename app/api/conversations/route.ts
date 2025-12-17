import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(_req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Transform for easier consumption
    const formatted = conversations.map((c) => {
      const otherParticipant = c.participants.find((p) => p.userId !== session.user.id)?.user
      const lastMessage = c.messages[0]
      const myParticipantData = c.participants.find((p) => p.userId === session.user.id)

      const isUnread =
        lastMessage && myParticipantData && lastMessage.createdAt > myParticipantData.lastReadAt

      return {
        id: c.id,
        otherUser: otherParticipant || { id: 'deleted', username: 'Deleted User', image: null },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              senderId: lastMessage.senderId,
            }
          : null,
        isUnread,
      }
    })

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('[API] Get Conversations failed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { targetUserId } = await req.json()
    if (!targetUserId) {
      return new NextResponse('Target User ID required', { status: 400 })
    }

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
    })

    if (existing) {
      return NextResponse.json({ id: existing.id })
    }

    // Create new
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: session.user.id }, { userId: targetUserId }],
        },
      },
    })

    return NextResponse.json({ id: conversation.id })
  } catch (error) {
    console.error('[API] Create Conversation failed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

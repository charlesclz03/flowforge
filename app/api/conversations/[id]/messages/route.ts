import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const conversationId = params.id

    // Verify membership
    const membership = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    })

    if (!membership) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 100, // Limit for MVP
    })

    // Mark as read
    // We do this async / don't wait? Or wait slightly.
    await prisma.conversationParticipant.update({
      where: { id: membership.id },
      data: { lastReadAt: new Date() },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('[API] Get Messages failed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const conversationId = params.id
    const { content } = await req.json()

    if (!content || !content.trim()) {
      return new NextResponse('Content required', { status: 400 })
    }

    // Verify membership
    const membership = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    })

    if (!membership) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Send Message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content: content.trim(),
      },
    })

    // Bump conversation updated at
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('[API] Send Message failed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

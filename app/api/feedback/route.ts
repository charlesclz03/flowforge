import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// POST: Submit new feedback
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { content, rating } = await req.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Feedback content is required' },
        { status: 400 }
      )
    }

    const feedback = await prisma.feedback.create({
      data: {
        content,
        rating: typeof rating === 'number' ? rating : undefined,
        userId: session?.user?.id || null,
      },
    })

    // If user is logged in and providing a rating, mark them as having rated
    if (session?.user?.id && typeof rating === 'number') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { hasRated: true },
      })
    }

    return NextResponse.json({ success: true, feedback }, { status: 201 })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

// GET: Retrieve feedback (Admin only)
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check for superadmin status
    // TODO: Ideally use a robust RBAC check, but strict email check works for now as per app convention
    const isSuperAdmin = [
      'triplyricist@gmail.com',
      'charles.cluzeaud@gmail.com',
    ].includes(session?.user?.email || '')

    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({ feedbacks })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

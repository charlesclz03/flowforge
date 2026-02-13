import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/auth/admin'
import { z } from 'zod'

const feedbackPayloadSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
})

// POST: Submit new feedback
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const parseResult = feedbackPayloadSchema.safeParse(await req.json())

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid feedback payload',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }
    const { content, rating } = parseResult.data

    const feedback = await prisma.feedback.create({
      data: {
        content,
        rating: rating ?? undefined,
        userId: session?.user?.id || null,
      },
    })

    // If user is logged in and providing a rating, mark them as having rated
    if (session?.user?.id && rating !== null && rating !== undefined) {
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
    if (!(await isSuperAdmin())) {
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

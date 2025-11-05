import { prisma } from '@/lib/prisma'
import { FreestyleSession, Prisma } from '@prisma/client'
import { SessionFilters, DatabaseResult, FreestyleSessionWithBeat } from '@/types/database'

/**
 * Create a new freestyle session (stub for MVP - mainly client-side)
 */
export async function createSession(
  data: Omit<FreestyleSession, 'id' | 'createdAt'>
): Promise<DatabaseResult<FreestyleSession>> {
  try {
    const session = await prisma.freestyleSession.create({
      data,
    })

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error('Error creating session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create session',
    }
  }
}

/**
 * Get sessions with optional filtering
 */
export async function getSessions(
  filters?: SessionFilters
): Promise<DatabaseResult<FreestyleSessionWithBeat[]>> {
  try {
    const where: Prisma.FreestyleSessionWhereInput = {}

    if (filters?.userId) {
      where.userId = filters.userId
    }

    if (filters?.beatId) {
      where.beatId = filters.beatId
    }

    if (filters?.difficulty) {
      where.difficulty = filters.difficulty
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      }
    }

    const sessions = await prisma.freestyleSession.findMany({
      where,
      include: {
        beat: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      data: sessions,
    }
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sessions',
    }
  }
}

/**
 * Get a single session by ID
 */
export async function getSessionById(
  id: string
): Promise<DatabaseResult<FreestyleSessionWithBeat>> {
  try {
    const session = await prisma.freestyleSession.findUnique({
      where: { id },
      include: {
        beat: true,
      },
    })

    if (!session) {
      return {
        success: false,
        error: 'Session not found',
      }
    }

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error('Error fetching session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch session',
    }
  }
}

/**
 * Delete a session
 */
export async function deleteSession(id: string): Promise<DatabaseResult<void>> {
  try {
    await prisma.freestyleSession.delete({
      where: { id },
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete session',
    }
  }
}

/**
 * Get session statistics
 */
export async function getSessionStats(userId?: string): Promise<
  DatabaseResult<{
    totalSessions: number
    totalDuration: number
    averageDuration: number
    favoriteGenre: string | null
  }>
> {
  try {
    const where: Prisma.FreestyleSessionWhereInput = userId ? { userId } : {}

    const [sessions, genreStats] = await Promise.all([
      prisma.freestyleSession.findMany({
        where,
        select: {
          durationSeconds: true,
        },
      }),
      prisma.freestyleSession.groupBy({
        by: ['beatId'],
        where,
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 1,
      }),
    ])

    const totalSessions = sessions.length
    const totalDuration = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
    const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0

    let favoriteGenre: string | null = null
    if (genreStats.length > 0) {
      const favoriteBeat = await prisma.beat.findUnique({
        where: { id: genreStats[0].beatId },
        select: { genre: true },
      })
      favoriteGenre = favoriteBeat?.genre || null
    }

    return {
      success: true,
      data: {
        totalSessions,
        totalDuration,
        averageDuration: Math.round(averageDuration),
        favoriteGenre,
      },
    }
  } catch (error) {
    console.error('Error fetching session stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch session stats',
    }
  }
}


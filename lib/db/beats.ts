import { prisma } from '@/lib/prisma'
import { Beat, Prisma } from '@prisma/client'
import { BeatFilters, DatabaseResult } from '@/types/database'

/**
 * Get all beats with optional filtering
 */
export async function getBeats(
  filters?: BeatFilters
): Promise<DatabaseResult<Beat[]>> {
  try {
    const where: Prisma.BeatWhereInput = {}

    if (filters?.isPremium !== undefined) {
      where.isPremium = filters.isPremium
    }

    if (filters?.genre) {
      where.genre = filters.genre
    }

    if (filters?.minBpm || filters?.maxBpm) {
      where.bpm = {
        ...(filters.minBpm && { gte: filters.minBpm }),
        ...(filters.maxBpm && { lte: filters.maxBpm }),
      }
    }

    const beats = await prisma.beat.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      data: beats,
    }
  } catch (error) {
    console.error('Error fetching beats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch beats',
    }
  }
}

/**
 * Get a single beat by ID
 */
export async function getBeatById(id: string): Promise<DatabaseResult<Beat>> {
  try {
    const beat = await prisma.beat.findUnique({
      where: { id },
    })

    if (!beat) {
      return {
        success: false,
        error: 'Beat not found',
      }
    }

    return {
      success: true,
      data: beat,
    }
  } catch (error) {
    console.error('Error fetching beat:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch beat',
    }
  }
}

/**
 * Get free (non-premium) beats for the MVP
 */
export async function getFreeBeats(): Promise<DatabaseResult<Beat[]>> {
  return getBeats({ isPremium: false })
}

/**
 * Get beats by genre
 */
export async function getBeatsByGenre(genre: string): Promise<DatabaseResult<Beat[]>> {
  return getBeats({ genre })
}

/**
 * Search beats by title
 */
export async function searchBeats(query: string): Promise<DatabaseResult<Beat[]>> {
  try {
    const beats = await prisma.beat.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            genre: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            artistName: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      data: beats,
    }
  } catch (error) {
    console.error('Error searching beats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search beats',
    }
  }
}

/**
 * Get all unique genres
 */
export async function getAllGenres(): Promise<DatabaseResult<string[]>> {
  try {
    const genres = await prisma.beat.findMany({
      where: {
        genre: {
          not: null,
        },
      },
      select: {
        genre: true,
      },
      distinct: ['genre'],
      orderBy: {
        genre: 'asc',
      },
    })

    const genreList = genres
      .map((b) => b.genre)
      .filter((g): g is string => g !== null)

    return {
      success: true,
      data: genreList,
    }
  } catch (error) {
    console.error('Error fetching genres:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch genres',
    }
  }
}


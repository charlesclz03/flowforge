import { prisma } from '@/lib/prisma'
import beatsData from '@/data/beats.json'
import { Beat, Prisma } from '@prisma/client'
import { BeatFilters, DatabaseResult } from '@/types/database'

/**
 * Get all beats with optional filtering
 */
export async function getBeats(filters?: BeatFilters): Promise<DatabaseResult<Beat[]>> {
  try {
    if (process.env.DISABLE_DB === 'true') {
      const all = (beatsData as unknown as Array<Partial<Beat> & { bpm: number; title: string; isPremium?: boolean; genre?: string }>).map((b) => ({
        id: 'fallback-' + b.title,
        title: b.title,
        bpm: b.bpm,
        storageUrl: '/beats/placeholder.mp3',
        isPremium: Boolean(b.isPremium),
        genre: b.genre ?? null,
        duration: null,
        artistName: 'FlowForge Beats',
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as unknown as Beat[]

      let filtered = all
      if (filters?.isPremium !== undefined) filtered = filtered.filter((b) => b.isPremium === filters.isPremium)
      if (filters?.genre) filtered = filtered.filter((b) => b.genre === filters.genre)
      if (filters?.minBpm || filters?.maxBpm) {
        filtered = filtered.filter((b) => {
          return (
            (filters?.minBpm ? b.bpm >= filters.minBpm : true) &&
            (filters?.maxBpm ? b.bpm <= filters.maxBpm : true)
          )
        })
      }

      return { success: true, data: filtered }
    }
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
    // Fallback to static data when DB is unavailable
    try {
      const all = (beatsData as unknown as Array<Partial<Beat> & { bpm: number; title: string; isPremium?: boolean; genre?: string }>).map((b) => ({
        id: 'fallback-' + b.title,
        title: b.title,
        bpm: b.bpm,
        storageUrl: '/beats/placeholder.mp3',
        isPremium: Boolean(b.isPremium),
        genre: b.genre ?? null,
        duration: null,
        artistName: 'FlowForge Beats',
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as unknown as Beat[]
      return { success: true, data: all }
    } catch (e) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch beats',
      }
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

    const genreList = genres.map((b) => b.genre).filter((g): g is string => g !== null)

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

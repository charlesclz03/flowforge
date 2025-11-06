import { prisma } from '@/lib/prisma'
import { Word, Prisma } from '@prisma/client'
import { WordFilters, DatabaseResult } from '@/types/database'

/**
 * Get random words based on filters
 */
export async function getRandomWords(
  count: number = 10,
  filters?: WordFilters
): Promise<DatabaseResult<Word[]>> {
  try {
    if (process.env.DISABLE_DB === 'true') {
      const fallback = [
        {
          id: 'w1',
          wordText: 'flow',
          syllableCount: 1,
          difficultyLevel: 1,
          category: 'noun',
          createdAt: new Date(),
        },
        {
          id: 'w2',
          wordText: 'rhythm',
          syllableCount: 2,
          difficultyLevel: 1,
          category: 'noun',
          createdAt: new Date(),
        },
        {
          id: 'w3',
          wordText: 'elevate',
          syllableCount: 3,
          difficultyLevel: 2,
          category: 'verb',
          createdAt: new Date(),
        },
        {
          id: 'w4',
          wordText: 'ambition',
          syllableCount: 3,
          difficultyLevel: 2,
          category: 'noun',
          createdAt: new Date(),
        },
        {
          id: 'w5',
          wordText: 'extraordinary',
          syllableCount: 5,
          difficultyLevel: 3,
          category: 'adjective',
          createdAt: new Date(),
        },
      ] as unknown as Word[]

      let pool = fallback
      if (filters?.difficultyLevel)
        pool = pool.filter((w) => w.difficultyLevel === filters.difficultyLevel)
      if (filters?.category) pool = pool.filter((w) => w.category === filters.category)

      const shuffled = pool.sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, count)
      return { success: true, data: selected }
    }
    const where: Prisma.WordWhereInput = {}

    if (filters?.difficultyLevel) {
      where.difficultyLevel = filters.difficultyLevel
    }

    if (filters?.category) {
      where.category = filters.category
    }

    if (filters?.minSyllables || filters?.maxSyllables) {
      where.syllableCount = {
        ...(filters.minSyllables && { gte: filters.minSyllables }),
        ...(filters.maxSyllables && { lte: filters.maxSyllables }),
      }
    }

    // First get all matching words
    const allWords = await prisma.word.findMany({
      where,
    })

    // Shuffle and take requested count
    const shuffled = allWords.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, count)

    return {
      success: true,
      data: selected,
    }
  } catch (error) {
    console.error('Error fetching random words:', error)
    // Fallback when DB is unavailable
    const fallback = [
      {
        id: 'w1',
        wordText: 'flow',
        syllableCount: 1,
        difficultyLevel: 1,
        category: 'noun',
        createdAt: new Date(),
      },
      {
        id: 'w2',
        wordText: 'rhythm',
        syllableCount: 2,
        difficultyLevel: 1,
        category: 'noun',
        createdAt: new Date(),
      },
      {
        id: 'w3',
        wordText: 'elevate',
        syllableCount: 3,
        difficultyLevel: 2,
        category: 'verb',
        createdAt: new Date(),
      },
      {
        id: 'w4',
        wordText: 'ambition',
        syllableCount: 3,
        difficultyLevel: 2,
        category: 'noun',
        createdAt: new Date(),
      },
      {
        id: 'w5',
        wordText: 'extraordinary',
        syllableCount: 5,
        difficultyLevel: 3,
        category: 'adjective',
        createdAt: new Date(),
      },
    ] as unknown as Word[]
    return { success: true, data: fallback.slice(0, count) }
  }
}

/**
 * Get words by difficulty level
 */
export async function getWordsByDifficulty(
  difficulty: number,
  count: number = 10
): Promise<DatabaseResult<Word[]>> {
  return getRandomWords(count, { difficultyLevel: difficulty })
}

/**
 * Get all words (for caching/preloading)
 */
export async function getAllWords(): Promise<DatabaseResult<Word[]>> {
  try {
    const words = await prisma.word.findMany({
      orderBy: {
        wordText: 'asc',
      },
    })

    return {
      success: true,
      data: words,
    }
  } catch (error) {
    console.error('Error fetching all words:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch words',
    }
  }
}

/**
 * Get word count by difficulty
 */
export async function getWordCountByDifficulty(): Promise<DatabaseResult<Record<number, number>>> {
  try {
    const counts = await prisma.word.groupBy({
      by: ['difficultyLevel'],
      _count: {
        id: true,
      },
    })

    const countMap: Record<number, number> = {}
    counts.forEach((item) => {
      countMap[item.difficultyLevel] = item._count.id
    })

    return {
      success: true,
      data: countMap,
    }
  } catch (error) {
    console.error('Error getting word counts:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get word counts',
    }
  }
}

/**
 * Search words
 */
export async function searchWords(query: string): Promise<DatabaseResult<Word[]>> {
  try {
    const words = await prisma.word.findMany({
      where: {
        wordText: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: {
        wordText: 'asc',
      },
      take: 50,
    })

    return {
      success: true,
      data: words,
    }
  } catch (error) {
    console.error('Error searching words:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search words',
    }
  }
}

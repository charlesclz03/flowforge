import { prisma } from '@/lib/prisma'
import { Word, Prisma } from '@prisma/client'
import { WordFilters, DatabaseResult } from '@/types/database'
import { DEFAULT_TTS_LANGUAGE } from '@/lib/tts/languages'
import { getFallbackWords } from '@/lib/data/fallbacks'

function normalizeWordKey(word: string): string {
  return word.trim().toLowerCase()
}

function dedupeWordsByText(words: Word[]): Word[] {
  const seen = new Set<string>()
  const deduped: Word[] = []

  for (const word of words) {
    const key = normalizeWordKey(word.wordText)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(word)
  }

  return deduped
}

/**
 * Get random words based on filters
 */
export async function getRandomWords(
  count: number = 10,
  filters?: WordFilters
): Promise<DatabaseResult<Word[]>> {
  try {
    const excludedWords = new Set(
      (filters?.excludeWordTexts || []).map(normalizeWordKey)
    )
    const excludeWord = (word: Word) =>
      excludedWords.has(normalizeWordKey(word.wordText))

    if (process.env.DISABLE_DB === 'true') {
      const language = filters?.language || DEFAULT_TTS_LANGUAGE
      const pool = getFallbackWords(
        language,
        filters?.difficultyLevel
      ) as Word[]
      const shuffled = dedupeWordsByText(pool)
        .filter((word) => !excludeWord(word))
        .sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, count)
      return { success: true, data: selected }
    }
    const where: Prisma.WordWhereInput = {}

    if (filters?.difficultyLevel) {
      where.difficultyLevel = filters.difficultyLevel
    }

    if (filters?.language) {
      where.language = filters.language
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
    const shuffled = dedupeWordsByText(allWords)
      .filter((word) => !excludeWord(word))
      .sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, count)

    return {
      success: true,
      data: selected,
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Timed out fetching a new connection')
    ) {
      console.warn(
        'DB connection pool exhausted when fetching words, using fallback list instead.'
      )
    } else {
      console.error('Error fetching random words:', error)
    }
    const language = filters?.language || DEFAULT_TTS_LANGUAGE
    const excludedWords = new Set(
      (filters?.excludeWordTexts || []).map(normalizeWordKey)
    )
    const pool = getFallbackWords(language, filters?.difficultyLevel) as Word[]
    const data = dedupeWordsByText(pool)
      .filter((word) => !excludedWords.has(normalizeWordKey(word.wordText)))
      .slice(0, count)
    return { success: true, data }
  }
}

/**
 * Get words by difficulty level
 */
export async function getWordsByDifficulty(
  difficulty: number,
  count: number = 10,
  language: string = DEFAULT_TTS_LANGUAGE
): Promise<DatabaseResult<Word[]>> {
  return getRandomWords(count, { difficultyLevel: difficulty, language })
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
export async function getWordCountByDifficulty(): Promise<
  DatabaseResult<Record<number, number>>
> {
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
      error:
        error instanceof Error ? error.message : 'Failed to get word counts',
    }
  }
}

/**
 * Search words
 */
export async function searchWords(
  query: string
): Promise<DatabaseResult<Word[]>> {
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

import { NextResponse } from 'next/server'
import { DEFAULT_TTS_LANGUAGE, resolveLanguageCode } from '@/lib/tts/languages'
import { getFallbackWords } from '@/lib/data/fallbacks'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '10')
    const difficulty = searchParams.get('difficulty')
      ? parseInt(searchParams.get('difficulty')!)
      : undefined
    const language = resolveLanguageCode(
      searchParams.get('language') ?? searchParams.get('lang')
    )
    const excludeWordTexts = Array.from(
      new Set(
        searchParams
          .getAll('exclude')
          .flatMap((value) => value.split(','))
          .map((value) => value.trim())
          .filter(Boolean)
      )
    )
    const excludedWordKeys = new Set(
      excludeWordTexts.map((word) => word.trim().toLowerCase())
    )

    // Dynamically import to prevent top-level crashes if module loading fails (e.g. Prisma issues)
    let wordsData: {
      wordText: string
      difficultyLevel: number
      language: string
    }[] = []

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getRandomWords } = await import('@/lib/db/words')

      const result = await getRandomWords(count, {
        difficultyLevel: difficulty,
        language,
        excludeWordTexts,
      })

      if (result.success && result.data && result.data.length > 0) {
        wordsData = result.data
      } else {
        throw new Error(result.error || 'No words found')
      }
    } catch (dbError) {
      console.warn('Database word fetch failed, using fallback:', dbError)
      wordsData = getFallbackWords(language, difficulty).filter(
        (word) => !excludedWordKeys.has(word.wordText.trim().toLowerCase())
      )
      if (wordsData.length === 0) wordsData = getFallbackWords()

      // Shuffle fallback words
      wordsData = wordsData.sort(() => Math.random() - 0.5)
    }

    // Ensure we respect the count
    const finalWords = wordsData.slice(0, count)

    return NextResponse.json(
      {
        words: finalWords,
        count: finalWords.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  } catch (error) {
    console.error('API Error:', error)
    // Absolute final failsafe - return JSON, never throw 500 HTML
    const fallback = getFallbackWords(DEFAULT_TTS_LANGUAGE)
    return NextResponse.json({
      words: fallback,
      count: fallback.length,
    })
  }
}

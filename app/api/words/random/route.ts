import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

// Fallback words to ensure the app works even if DB fails
const FALLBACK_WORDS = [
  { wordText: 'flow', difficultyLevel: 1 },
  { wordText: 'rhythm', difficultyLevel: 1 },
  { wordText: 'create', difficultyLevel: 1 },
  { wordText: 'inspire', difficultyLevel: 2 },
  { wordText: 'elevate', difficultyLevel: 2 },
  { wordText: 'manifest', difficultyLevel: 2 },
  { wordText: 'extraordinary', difficultyLevel: 3 },
  { wordText: 'unprecedented', difficultyLevel: 3 },
  { wordText: 'revolutionary', difficultyLevel: 3 },
  { wordText: 'legacy', difficultyLevel: 2 },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '10')
    const category = searchParams.get('category') || undefined
    const difficulty = searchParams.get('difficulty')
      ? parseInt(searchParams.get('difficulty')!)
      : undefined

    // Dynamically import to prevent top-level crashes if module loading fails (e.g. Prisma issues)
    let wordsData: { wordText: string }[] = []

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getRandomWords } = await import('@/lib/db/words')

      const result = await getRandomWords(count, {
        difficultyLevel: difficulty,
        category: category,
      })

      if (result.success && result.data && result.data.length > 0) {
        wordsData = result.data
      } else {
        throw new Error(result.error || 'No words found')
      }
    } catch (dbError) {
      console.warn('Database word fetch failed, using fallback:', dbError)
      // Filter fallback words loosely based on difficulty if requested
      wordsData = FALLBACK_WORDS.filter((w) =>
        difficulty ? w.difficultyLevel === difficulty : true
      )
      // If filtering resulted in empty, just use all safety words
      if (wordsData.length === 0) wordsData = FALLBACK_WORDS

      // Shuffle fallback words
      wordsData = wordsData.sort(() => Math.random() - 0.5)
    }

    // Ensure we respect the count
    const finalWords = wordsData.slice(0, count)

    return NextResponse.json({
      words: finalWords,
      count: finalWords.length,
    })
  } catch (error) {
    console.error('API Error:', error)
    // Absolute final failsafe - return JSON, never throw 500 HTML
    return NextResponse.json({
      words: FALLBACK_WORDS,
      count: FALLBACK_WORDS.length,
    })
  }
}

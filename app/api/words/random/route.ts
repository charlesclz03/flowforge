import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

// Fallback words to ensure the app works even if DB fails
// Fallback words to ensure the app works even if DB fails - Expanded list
const FALLBACK_WORDS = [
  // Easy (1 Syllable)
  { wordText: 'flow', difficultyLevel: 1 },
  { wordText: 'beam', difficultyLevel: 1 },
  { wordText: 'shine', difficultyLevel: 1 },
  { wordText: 'rise', difficultyLevel: 1 },
  { wordText: 'prime', difficultyLevel: 1 },
  { wordText: 'peak', difficultyLevel: 1 },
  { wordText: 'vibe', difficultyLevel: 1 },
  { wordText: 'zone', difficultyLevel: 1 },
  { wordText: 'truth', difficultyLevel: 1 },
  { wordText: 'light', difficultyLevel: 1 },
  { wordText: 'space', difficultyLevel: 1 },
  { wordText: 'time', difficultyLevel: 1 },
  { wordText: 'dream', difficultyLevel: 1 },
  { wordText: 'spark', difficultyLevel: 1 },
  { wordText: 'soul', difficultyLevel: 1 },
  { wordText: 'mind', difficultyLevel: 1 },
  { wordText: 'path', difficultyLevel: 1 },
  { wordText: 'trust', difficultyLevel: 1 },
  { wordText: 'build', difficultyLevel: 1 },
  { wordText: 'create', difficultyLevel: 1 },

  // Medium (2-3 Syllables)
  { wordText: 'rhythm', difficultyLevel: 2 },
  { wordText: 'vision', difficultyLevel: 2 },
  { wordText: 'power', difficultyLevel: 2 },
  { wordText: 'spirit', difficultyLevel: 2 },
  { wordText: 'focus', difficultyLevel: 2 },
  { wordText: 'action', difficultyLevel: 2 },
  { wordText: 'motion', difficultyLevel: 2 },
  { wordText: 'journey', difficultyLevel: 2 },
  { wordText: 'balance', difficultyLevel: 2 },
  { wordText: 'freedom', difficultyLevel: 2 },
  { wordText: 'energy', difficultyLevel: 2 },
  { wordText: 'inspire', difficultyLevel: 2 },
  { wordText: 'elevate', difficultyLevel: 2 },
  { wordText: 'manifest', difficultyLevel: 2 },
  { wordText: 'legacy', difficultyLevel: 2 },
  { wordText: 'destiny', difficultyLevel: 2 },
  { wordText: 'clarity', difficultyLevel: 2 },
  { wordText: 'passion', difficultyLevel: 2 },
  { wordText: 'purpose', difficultyLevel: 2 },
  { wordText: 'progress', difficultyLevel: 2 },

  // Hard (4+ Syllables / Complex)
  { wordText: 'imagination', difficultyLevel: 3 },
  { wordText: 'extraordinary', difficultyLevel: 3 },
  { wordText: 'unprecedented', difficultyLevel: 3 },
  { wordText: 'revolutionary', difficultyLevel: 3 },
  { wordText: 'opportunity', difficultyLevel: 3 },
  { wordText: 'possibility', difficultyLevel: 3 },
  { wordText: 'dedication', difficultyLevel: 3 },
  { wordText: 'inspiration', difficultyLevel: 3 },
  { wordText: 'motivation', difficultyLevel: 3 },
  { wordText: 'evolution', difficultyLevel: 3 },
  { wordText: 'perspective', difficultyLevel: 3 },
  { wordText: 'transformation', difficultyLevel: 3 },
  { wordText: 'authenticity', difficultyLevel: 3 },
  { wordText: 'realization', difficultyLevel: 3 },
  { wordText: 'elevation', difficultyLevel: 3 },
  { wordText: 'generation', difficultyLevel: 3 },
  { wordText: 'liberation', difficultyLevel: 3 },
  { wordText: 'celebration', difficultyLevel: 3 },
  { wordText: 'foundation', difficultyLevel: 3 },
  { wordText: 'intuition', difficultyLevel: 3 },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '10')
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

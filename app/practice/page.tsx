import { getBeats } from '@/lib/db/beats'
import { getRandomWords } from '@/lib/db/words'
import { resolveLanguageCode } from '@/lib/tts/languages'
import { getFallbackWords } from '@/lib/data/fallbacks'
import type { PracticeWordSeed } from '@/lib/words/practice-word-seed'
import { redirectIncompleteProfileSetupIfNeeded } from '@/lib/auth/require-user-session'
import PracticeClient from './PracticeClient'

export const revalidate = 3600 // Cache for 1 hour

export default async function PracticePage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string; language?: string }>
}) {
  await redirectIncompleteProfileSetupIfNeeded('/practice')
  const params = (await searchParams) || {}
  const language = resolveLanguageCode(params.lang ?? params.language)

  // Fetch beats directly from DB (Server Side)
  const beatsResult = await getBeats()
  const initialBeats =
    beatsResult.success && beatsResult.data ? beatsResult.data : []

  // Fetch a larger pool so session queues can stay unique without early top-ups.
  const wordsResult = await getRandomWords(160, { language })

  // Flatten words to simple string array as expected by client
  let initialWords: PracticeWordSeed[] =
    wordsResult.success && wordsResult.data
      ? wordsResult.data.map((w) => ({
          wordText: w.wordText,
          difficultyLevel: w.difficultyLevel,
          syllableCount: w.syllableCount,
        }))
      : []

  // Server-Side Fallback (Double Safety)
  if (initialWords.length === 0) {
    initialWords = getFallbackWords(language).map((word) => ({
      wordText: word.wordText,
      difficultyLevel: word.difficultyLevel,
      syllableCount: word.syllableCount,
    }))
  }

  return (
    <PracticeClient
      initialBeats={initialBeats}
      initialWords={initialWords}
      initialLanguage={language}
    />
  )
}

import { getBeats } from '@/lib/db/beats'
import { getRandomWords } from '@/lib/db/words'
import { resolveLanguageCode } from '@/lib/tts/languages'
import { getFallbackWords } from '@/lib/data/fallbacks'
import PracticeClient from './PracticeClient'

export const revalidate = 3600 // Cache for 1 hour

export default async function PracticePage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string; language?: string }>
}) {
  const params = (await searchParams) || {}
  const language = resolveLanguageCode(params.lang ?? params.language)

  // Fetch beats directly from DB (Server Side)
  const beatsResult = await getBeats()
  const initialBeats =
    beatsResult.success && beatsResult.data ? beatsResult.data : []

  // Fetch initial words (Server Side) - Default count 100
  const wordsResult = await getRandomWords(100, { language })

  // Flatten words to simple string array as expected by client
  let initialWords =
    wordsResult.success && wordsResult.data
      ? wordsResult.data.map((w) => w.wordText)
      : []

  // Server-Side Fallback (Double Safety)
  if (initialWords.length === 0) {
    initialWords = getFallbackWords(language).map((word) => word.wordText)
  }

  return (
    <PracticeClient
      initialBeats={initialBeats}
      initialWords={initialWords}
      initialLanguage={language}
    />
  )
}

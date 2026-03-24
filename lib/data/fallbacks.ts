import {
  DEFAULT_TTS_LANGUAGE,
  resolveLanguageCode,
  TTSLanguageCode,
} from '@/lib/tts/languages'
import {
  ENGLISH_WORD_PACK,
  FRENCH_WORD_PACK,
  PORTUGUESE_WORD_PACK,
  type WordPackEntry,
} from '@/lib/words/multilingual-word-packs'

export interface FallbackWord {
  id: string
  wordText: string
  language: TTSLanguageCode
  syllableCount: number
  difficultyLevel: number
  category: string
  createdAt: Date
}

const NOW = new Date('2026-01-01T00:00:00.000Z')

const WORD_PACKS: Record<TTSLanguageCode, WordPackEntry[]> = {
  'en-US': ENGLISH_WORD_PACK,
  'fr-FR': FRENCH_WORD_PACK,
  'pt-PT': PORTUGUESE_WORD_PACK,
}

function withIds(
  words: WordPackEntry[],
  prefix: string,
  language: TTSLanguageCode
) {
  return words.map((word, index) => ({
    ...word,
    id: `${prefix}-${index + 1}`,
    language,
    createdAt: NOW,
  }))
}

export const FALLBACK_WORDS: FallbackWord[] = [
  ...withIds(WORD_PACKS['en-US'], 'en', 'en-US'),
  ...withIds(WORD_PACKS['fr-FR'], 'fr', 'fr-FR'),
  ...withIds(WORD_PACKS['pt-PT'], 'pt', 'pt-PT'),
]

export function getFallbackWords(
  language: string = DEFAULT_TTS_LANGUAGE,
  difficulty?: number
): FallbackWord[] {
  const resolvedLanguage = resolveLanguageCode(language)
  const byLanguage = FALLBACK_WORDS.filter(
    (word) => word.language === resolvedLanguage
  )
  const languagePool = byLanguage.length > 0 ? byLanguage : FALLBACK_WORDS

  if (!difficulty || difficulty === 4) {
    return languagePool
  }

  const byDifficulty = languagePool.filter(
    (word) => word.difficultyLevel === difficulty
  )
  return byDifficulty.length > 0 ? byDifficulty : languagePool
}

export const FALLBACK_BEATS = [
  {
    id: 'fallback-1',
    title: 'Classic Flow (Offline)',
    bpm: 90,
    storageUrl: '/beats/2-Naughty.mp3',
    isPremium: false,
    artistName: 'FreeStyla Default',
    genre: 'Boom Bap',
    duration: 180,
    tags: ['offline', 'fallback'],
  },
  {
    id: 'fallback-2',
    title: 'Modern Trap (Offline)',
    bpm: 140,
    storageUrl: '/beats/2-Naughty.mp3',
    isPremium: false,
    artistName: 'FreeStyla Default',
    genre: 'Trap',
    duration: 180,
    tags: ['offline', 'fallback'],
  },
]

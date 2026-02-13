import {
  DEFAULT_TTS_LANGUAGE,
  resolveLanguageCode,
  TTSLanguageCode,
} from '@/lib/tts/languages'

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

const EN_WORDS: Omit<FallbackWord, 'id' | 'createdAt'>[] = [
  {
    wordText: 'flow',
    language: 'en-US',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'spark',
    language: 'en-US',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'grind',
    language: 'en-US',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'verb',
  },
  {
    wordText: 'voice',
    language: 'en-US',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'beat',
    language: 'en-US',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'street',
    language: 'en-US',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'fire',
    language: 'en-US',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'focus',
    language: 'en-US',
    syllableCount: 2,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'energy',
    language: 'en-US',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'rhythm',
    language: 'en-US',
    syllableCount: 2,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'vision',
    language: 'en-US',
    syllableCount: 2,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'balance',
    language: 'en-US',
    syllableCount: 2,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'hustle',
    language: 'en-US',
    syllableCount: 2,
    difficultyLevel: 2,
    category: 'verb',
  },
  {
    wordText: 'legacy',
    language: 'en-US',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'imagination',
    language: 'en-US',
    syllableCount: 5,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'revolutionary',
    language: 'en-US',
    syllableCount: 5,
    difficultyLevel: 3,
    category: 'adjective',
  },
  {
    wordText: 'perspective',
    language: 'en-US',
    syllableCount: 3,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'opportunity',
    language: 'en-US',
    syllableCount: 5,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'elevation',
    language: 'en-US',
    syllableCount: 4,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'authenticity',
    language: 'en-US',
    syllableCount: 5,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'transformation',
    language: 'en-US',
    syllableCount: 4,
    difficultyLevel: 3,
    category: 'noun',
  },
]

const FR_WORDS: Omit<FallbackWord, 'id' | 'createdAt'>[] = [
  {
    wordText: 'rime',
    language: 'fr-FR',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'flamme',
    language: 'fr-FR',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'scene',
    language: 'fr-FR',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'voix',
    language: 'fr-FR',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'style',
    language: 'fr-FR',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'beat',
    language: 'fr-FR',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'phase',
    language: 'fr-FR',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'energie',
    language: 'fr-FR',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'rythme',
    language: 'fr-FR',
    syllableCount: 1,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'vision',
    language: 'fr-FR',
    syllableCount: 2,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'horizon',
    language: 'fr-FR',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'parcours',
    language: 'fr-FR',
    syllableCount: 2,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'respect',
    language: 'fr-FR',
    syllableCount: 2,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'ambition',
    language: 'fr-FR',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'determination',
    language: 'fr-FR',
    syllableCount: 5,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'imagination',
    language: 'fr-FR',
    syllableCount: 5,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'vibration',
    language: 'fr-FR',
    syllableCount: 3,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'authentique',
    language: 'fr-FR',
    syllableCount: 3,
    difficultyLevel: 3,
    category: 'adjective',
  },
  {
    wordText: 'transformation',
    language: 'fr-FR',
    syllableCount: 4,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'constellation',
    language: 'fr-FR',
    syllableCount: 4,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'expression',
    language: 'fr-FR',
    syllableCount: 3,
    difficultyLevel: 3,
    category: 'noun',
  },
]

const PT_WORDS: Omit<FallbackWord, 'id' | 'createdAt'>[] = [
  {
    wordText: 'rima',
    language: 'pt-PT',
    syllableCount: 2,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'voz',
    language: 'pt-PT',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'pulso',
    language: 'pt-PT',
    syllableCount: 2,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'ritmo',
    language: 'pt-PT',
    syllableCount: 2,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'flow',
    language: 'pt-PT',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'chama',
    language: 'pt-PT',
    syllableCount: 2,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'forca',
    language: 'pt-PT',
    syllableCount: 2,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'energia',
    language: 'pt-PT',
    syllableCount: 4,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'visao',
    language: 'pt-PT',
    syllableCount: 2,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'caminho',
    language: 'pt-PT',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'batida',
    language: 'pt-PT',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'proposito',
    language: 'pt-PT',
    syllableCount: 4,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'atitude',
    language: 'pt-PT',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'respeito',
    language: 'pt-PT',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'determinacao',
    language: 'pt-PT',
    syllableCount: 5,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'transformacao',
    language: 'pt-PT',
    syllableCount: 4,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'autenticidade',
    language: 'pt-PT',
    syllableCount: 6,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'oportunidade',
    language: 'pt-PT',
    syllableCount: 6,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'constelacao',
    language: 'pt-PT',
    syllableCount: 4,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'manifestacao',
    language: 'pt-PT',
    syllableCount: 5,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'imaginacao',
    language: 'pt-PT',
    syllableCount: 5,
    difficultyLevel: 3,
    category: 'noun',
  },
]

function withIds(
  words: Omit<FallbackWord, 'id' | 'createdAt'>[],
  prefix: string
) {
  return words.map((word, index) => ({
    ...word,
    id: `${prefix}-${index + 1}`,
    createdAt: NOW,
  }))
}

export const FALLBACK_WORDS: FallbackWord[] = [
  ...withIds(EN_WORDS, 'en'),
  ...withIds(FR_WORDS, 'fr'),
  ...withIds(PT_WORDS, 'pt'),
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

import { describe, expect, it } from 'vitest'
import { DEFAULT_TTS_LANGUAGE } from '@/lib/tts/languages'
import { FALLBACK_WORDS, getFallbackWords } from '@/lib/data/fallbacks'

describe('fallback dictionaries', () => {
  it('should include EN, FR, and PT entries', () => {
    const languages = new Set(FALLBACK_WORDS.map((word) => word.language))
    expect(languages.has('en-US')).toBe(true)
    expect(languages.has('fr-FR')).toBe(true)
    expect(languages.has('pt-PT')).toBe(true)
  })

  it('should filter by language and difficulty', () => {
    const frenchMedium = getFallbackWords('fr-FR', 2)
    expect(frenchMedium.length).toBeGreaterThan(0)
    expect(frenchMedium.every((word) => word.language === 'fr-FR')).toBe(true)
    expect(frenchMedium.every((word) => word.difficultyLevel === 2)).toBe(true)
  })

  it('should fallback to default language pool when language is unknown', () => {
    const unknown = getFallbackWords('xx-XX', 1)
    const defaultEasy = getFallbackWords(DEFAULT_TTS_LANGUAGE, 1)
    expect(unknown.length).toBeGreaterThan(0)
    expect(defaultEasy.length).toBeGreaterThan(0)
  })
})

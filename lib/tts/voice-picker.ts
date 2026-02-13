import {
  DEFAULT_TTS_LANGUAGE,
  getLanguageAliases,
  normalizeLangTag,
} from '@/lib/tts/languages'

/**
 * Smart Voice Picker for FlowForge
 *
 * Browsers default to the "Native" voice, which is often robotic.
 * This utility ranks available voices to find a "Premium" sounding one.
 */

export interface VoicePreference {
  langPrefix: string
  name?: string
  priority: number
}

const LANGUAGE_PREFERENCES: Record<string, VoicePreference[]> = {
  en: [
    { langPrefix: 'en-us', name: 'Google US English', priority: 120 },
    { langPrefix: 'en-us', name: 'Samantha', priority: 110 },
    { langPrefix: 'en-gb', name: 'Daniel', priority: 105 },
    { langPrefix: 'en-us', name: 'Microsoft Zira', priority: 100 },
    { langPrefix: 'en', priority: 30 },
  ],
  fr: [
    { langPrefix: 'fr-fr', name: 'Google francais', priority: 120 },
    { langPrefix: 'fr-fr', name: 'Amelie', priority: 110 },
    { langPrefix: 'fr-ca', name: 'Thomas', priority: 90 },
    { langPrefix: 'fr', priority: 30 },
  ],
  pt: [
    { langPrefix: 'pt-br', name: 'Google português do Brasil', priority: 120 },
    { langPrefix: 'pt-pt', name: 'Joana', priority: 110 },
    { langPrefix: 'pt', priority: 30 },
  ],
}

function getTargetPreferences(targetLang: string): VoicePreference[] {
  const normalized = normalizeLangTag(targetLang)
  const base = normalized.split('-')[0]
  return LANGUAGE_PREFERENCES[base] ?? LANGUAGE_PREFERENCES.en
}

function matchesAlias(voiceLang: string, aliases: string[]): boolean {
  const normalizedVoiceLang = normalizeLangTag(voiceLang)
  return aliases.some((alias) => {
    const normalizedAlias = normalizeLangTag(alias)
    const aliasBase = normalizedAlias.split('-')[0]
    return (
      normalizedVoiceLang === normalizedAlias ||
      normalizedVoiceLang.startsWith(`${aliasBase}-`) ||
      normalizedVoiceLang === aliasBase
    )
  })
}

export function hasVoiceForLanguage(
  voices: SpeechSynthesisVoice[],
  targetLang: string
): boolean {
  const aliases = getLanguageAliases(targetLang)
  return voices.some((voice) => matchesAlias(voice.lang, aliases))
}

export const getBestVoice = (
  voices: SpeechSynthesisVoice[],
  targetLang: string = DEFAULT_TTS_LANGUAGE
): SpeechSynthesisVoice | null => {
  if (!voices || voices.length === 0) return null

  const aliases = getLanguageAliases(targetLang)
  const matchingVoices = voices.filter((voice) =>
    matchesAlias(voice.lang, aliases)
  )
  const pool = matchingVoices.length > 0 ? matchingVoices : voices
  const preferences = getTargetPreferences(targetLang)

  const scored = pool.map((voice) => {
    const lang = normalizeLangTag(voice.lang)
    let score = 0

    if (matchesAlias(voice.lang, aliases)) {
      score += 200
    }

    for (const pref of preferences) {
      const prefPrefix = pref.langPrefix
      if (lang === prefPrefix || lang.startsWith(`${prefPrefix}-`)) {
        if (pref.name) {
          if (voice.name.toLowerCase().includes(pref.name.toLowerCase())) {
            score += pref.priority
          }
        } else {
          score += pref.priority
        }
      }
    }

    if (voice.localService) score += 10
    if (voice.default) score += 3

    return { voice, score }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored[0].voice
}

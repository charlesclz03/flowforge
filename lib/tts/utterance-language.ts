import {
  DEFAULT_TTS_LANGUAGE,
  normalizeLangTag,
  TTSLanguageCode,
} from '@/lib/tts/languages'

export type TTSVoiceStatus = 'unsupported' | 'loading' | 'ready' | 'fallback'

interface ResolveUtteranceLanguageParams {
  requestedLanguage: TTSLanguageCode
  activeVoice: SpeechSynthesisVoice | null
  voiceStatus: TTSVoiceStatus
}

/**
 * Resolve a stable utterance language that prefers audibility over silence.
 *
 * - If a fallback voice exists and is from another language family, use that voice language.
 * - If no voice is available yet in loading/fallback states, fall back to the default locale.
 */
export function resolveUtteranceLanguage({
  requestedLanguage,
  activeVoice,
  voiceStatus,
}: ResolveUtteranceLanguageParams): string {
  if (voiceStatus === 'unsupported') {
    return requestedLanguage
  }

  if (!activeVoice?.lang) {
    if (voiceStatus === 'fallback' || voiceStatus === 'loading') {
      return DEFAULT_TTS_LANGUAGE
    }
    return requestedLanguage
  }

  if (voiceStatus !== 'fallback') {
    return requestedLanguage
  }

  const requestedBase = normalizeLangTag(requestedLanguage).split('-')[0]
  const voiceBase = normalizeLangTag(activeVoice.lang).split('-')[0]

  // Keep the requested locale when fallback is within the same language family.
  if (requestedBase === voiceBase) {
    return requestedLanguage
  }

  return activeVoice.lang
}

import { describe, expect, it } from 'vitest'
import {
  resolveUtteranceLanguage,
  type TTSVoiceStatus,
} from '@/lib/tts/utterance-language'

function voice(lang: string): SpeechSynthesisVoice {
  return {
    default: false,
    lang,
    localService: true,
    name: `Voice ${lang}`,
    voiceURI: `voice-${lang}`,
  } as SpeechSynthesisVoice
}

function resolve(
  requestedLanguage: 'en-US' | 'fr-FR' | 'pt-PT',
  status: TTSVoiceStatus,
  activeVoice: SpeechSynthesisVoice | null
): string {
  return resolveUtteranceLanguage({
    requestedLanguage,
    voiceStatus: status,
    activeVoice,
  })
}

describe('resolveUtteranceLanguage', () => {
  it('keeps selected language when voice is ready', () => {
    const result = resolve('fr-FR', 'ready', voice('fr-FR'))
    expect(result).toBe('fr-FR')
  })

  it('uses fallback voice language when fallback voice family differs', () => {
    const result = resolve('fr-FR', 'fallback', voice('en-US'))
    expect(result).toBe('en-US')
  })

  it('keeps selected language when fallback voice is same family', () => {
    const result = resolve('fr-FR', 'fallback', voice('fr-CA'))
    expect(result).toBe('fr-FR')
  })

  it('falls back to default language when loading has no active voice', () => {
    const result = resolve('pt-PT', 'loading', null)
    expect(result).toBe('en-US')
  })
})

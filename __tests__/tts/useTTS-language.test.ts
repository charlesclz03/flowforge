import { describe, expect, it } from 'vitest'
import { resolveUtteranceLanguage, type TTSVoiceStatus } from '@/hooks/useTTS'

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
  it('uses selected language when voice status is ready', () => {
    const result = resolve('fr-FR', 'ready', voice('fr-FR'))
    expect(result).toBe('fr-FR')
  })

  it('uses fallback voice language when fallback voice is from a different language family', () => {
    const result = resolve('fr-FR', 'fallback', voice('en-US'))
    expect(result).toBe('en-US')
  })

  it('keeps selected language when fallback voice is same language family', () => {
    const result = resolve('fr-FR', 'fallback', voice('fr-CA'))
    expect(result).toBe('fr-FR')
  })

  it('keeps selected language when no active voice exists', () => {
    const result = resolve('pt-PT', 'fallback', null)
    expect(result).toBe('pt-PT')
  })
})

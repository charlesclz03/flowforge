import { describe, expect, it } from 'vitest'
import { getBestVoice, hasVoiceForLanguage } from '@/lib/tts/voice-picker'

function voice(
  name: string,
  lang: string,
  options?: Partial<SpeechSynthesisVoice>
): SpeechSynthesisVoice {
  return {
    default: false,
    lang,
    localService: true,
    name,
    voiceURI: `${name}-${lang}`,
    ...options,
  } as SpeechSynthesisVoice
}

describe('voice-picker', () => {
  it('should detect matching voice aliases per language', () => {
    const voices = [
      voice('Google US English', 'en-US'),
      voice('Google francais', 'fr-FR'),
      voice('Google portugues do Brasil', 'pt-BR'),
    ]

    expect(hasVoiceForLanguage(voices, 'en-US')).toBe(true)
    expect(hasVoiceForLanguage(voices, 'fr-FR')).toBe(true)
    expect(hasVoiceForLanguage(voices, 'pt-PT')).toBe(true)
  })

  it('should prefer a matching language voice over default mismatch', () => {
    const voices = [
      voice('Some English Voice', 'en-US', { default: true }),
      voice('Google francais', 'fr-FR'),
    ]

    const selected = getBestVoice(voices, 'fr-FR')
    expect(selected?.lang.toLowerCase()).toContain('fr')
  })

  it('should gracefully fallback when no language match exists', () => {
    const voices = [voice('System English', 'en-US')]
    const selected = getBestVoice(voices, 'fr-FR')
    expect(selected).not.toBeNull()
    expect(selected?.name).toContain('System English')
  })
})

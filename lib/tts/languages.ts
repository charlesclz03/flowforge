export const TTS_LANGUAGE_CODES = ['en-US', 'fr-FR', 'pt-PT'] as const

export type TTSLanguageCode = (typeof TTS_LANGUAGE_CODES)[number]

export interface TTSLanguageOption {
  code: TTSLanguageCode
  label: string
  shortLabel: string
  aliases: string[]
  testPhrase: string
  voiceGuidance: string
}

export const TTS_LANGUAGE_OPTIONS: TTSLanguageOption[] = [
  {
    code: 'en-US',
    label: 'English',
    shortLabel: 'EN',
    aliases: ['en-US', 'en-GB', 'en'],
    testPhrase: 'Mic check, one two. FreeStyla is ready.',
    voiceGuidance:
      'English voice packs are usually preinstalled. If prompts are silent, tap once to enable audio in browser.',
  },
  {
    code: 'fr-FR',
    label: 'French',
    shortLabel: 'FR',
    aliases: ['fr-FR', 'fr-CA', 'fr'],
    testPhrase: 'Micro test, un deux. FreeStyla est pret.',
    voiceGuidance:
      'Install a French voice in your device speech settings to unlock spoken prompts.',
  },
  {
    code: 'pt-PT',
    label: 'Portuguese',
    shortLabel: 'PT',
    aliases: ['pt-PT', 'pt-BR', 'pt'],
    testPhrase: 'Teste de microfone. FreeStyla esta pronto.',
    voiceGuidance:
      'Install a Portuguese voice package in your device speech settings to unlock spoken prompts.',
  },
]

export const DEFAULT_TTS_LANGUAGE: TTSLanguageCode = 'en-US'

export function normalizeLangTag(tag: string): string {
  return tag.toLowerCase().replace('_', '-')
}

const LANGUAGE_ALIAS_LOOKUP = (() => {
  const lookup = new Map<string, TTSLanguageCode>()

  for (const option of TTS_LANGUAGE_OPTIONS) {
    const aliases = [option.code, ...option.aliases]

    for (const alias of aliases) {
      const normalized = normalizeLangTag(alias)
      lookup.set(normalized, option.code)

      const base = normalized.split('-')[0]
      if (!lookup.has(base)) {
        lookup.set(base, option.code)
      }
    }
  }

  return lookup
})()

export function resolveLanguageCode(code?: string | null): TTSLanguageCode {
  if (!code) return DEFAULT_TTS_LANGUAGE

  const normalized = normalizeLangTag(code)
  const exact = LANGUAGE_ALIAS_LOOKUP.get(normalized)
  if (exact) return exact

  const base = normalized.split('-')[0]
  const baseMatch = LANGUAGE_ALIAS_LOOKUP.get(base)
  if (baseMatch) return baseMatch

  return DEFAULT_TTS_LANGUAGE
}

export function getLanguageOption(code?: string | null): TTSLanguageOption {
  const resolved = resolveLanguageCode(code)
  return (
    TTS_LANGUAGE_OPTIONS.find((option) => option.code === resolved) ??
    TTS_LANGUAGE_OPTIONS[0]
  )
}

export function getLanguageAliases(code: string): string[] {
  const option = getLanguageOption(code)
  return [option.code, ...option.aliases]
}

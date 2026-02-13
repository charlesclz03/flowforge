import { DEFAULT_TTS_LANGUAGE } from '@/lib/tts/languages'

const RHYME_KEY_CACHE = new Map<string, string>()

function sanitizeWord(input: string): string {
  return input.toLowerCase().replace(/[^a-z]/g, '')
}

function getLanguageBase(language: string): string {
  return language.toLowerCase().split('-')[0]
}

function normalizeEnglish(word: string): string {
  let normalized = word
  // Keep short-word "y" sounds aligned with long-i (sky, my, try).
  if (normalized.endsWith('y')) {
    normalized =
      normalized.length <= 4
        ? `${normalized.slice(0, -1)}ai`
        : `${normalized.slice(0, -1)}ee`
  }

  // Normalize rhyme-critical endings.
  normalized = normalized.replace(/(ie|ye)$/g, 'ai')
  normalized = normalized.replace(/igh$/g, 'ai')
  normalized = normalized.replace(/(ay|ai|ei|ey)$/g, 'ai')
  normalized = normalized.replace(/(oa|oe|ow)$/g, 'oh')
  normalized = normalized.replace(/(oo|ue|ew)$/g, 'oo')
  normalized = normalized.replace(/(ee|ea)$/g, 'ee')
  normalized = normalized.replace(/ies$/g, 'eez')
  normalized = normalized.replace(/ied$/g, 'aid')
  return normalized
}

function normalizeFrench(word: string): string {
  let normalized = word
  normalized = normalized.replace(/(e|es|ent)$/g, '')
  normalized = normalized.replace(/(eau|au)$/g, 'o')
  normalized = normalized.replace(/oi/g, 'wa')
  normalized = normalized.replace(/(ai|ei|er|et)$/g, 'e')
  normalized = normalized.replace(/tion$/g, 'sion')
  return normalized
}

function normalizePortuguese(word: string): string {
  let normalized = word
  normalized = normalized.replace(/coes$/g, 'koes')
  normalized = normalized.replace(/sao$/g, 'sao')
  normalized = normalized.replace(/cao$/g, 'sao')
  normalized = normalized.replace(/oes$/g, 'oes')
  normalized = normalized.replace(/ao$/g, 'ao')
  normalized = normalized.replace(/am$/g, 'ao')
  normalized = normalized.replace(/em$/g, 'en')
  normalized = normalized.replace(/nh/g, 'ny')
  normalized = normalized.replace(/lh/g, 'ly')
  return normalized
}

function normalizeEndingPhonetics(
  input: string,
  language: string = DEFAULT_TTS_LANGUAGE
): string {
  let word = sanitizeWord(input)
  if (!word) return ''

  // Normalize common multi-letter sounds first.
  word = word.replace(/(tion|sion|cion|xion)$/g, 'shun')
  word = word.replace(/(ture|sure)$/g, 'cher')
  word = word.replace(/ph/g, 'f')
  word = word.replace(/ck/g, 'k')
  word = word.replace(/dge/g, 'j')
  word = word.replace(/mb$/g, 'm')
  word = word.replace(/([^aeiou])e$/g, '$1') // silent trailing e

  switch (getLanguageBase(language)) {
    case 'fr':
      word = normalizeFrench(word)
      break
    case 'pt':
      word = normalizePortuguese(word)
      break
    default:
      word = normalizeEnglish(word)
      break
  }

  return word
}

function computePhoneticRhymeKey(
  input: string,
  language: string = DEFAULT_TTS_LANGUAGE
): string {
  const normalized = normalizeEndingPhonetics(input, language)
  if (!normalized) return ''

  const vowelGroups = [...normalized.matchAll(/[aeiou]+/g)]
  if (vowelGroups.length === 0) {
    return normalized.slice(-3)
  }

  const lastGroup = vowelGroups[vowelGroups.length - 1]
  const index = lastGroup.index ?? 0
  let key = normalized.slice(index)

  // Avoid overly generic one-letter keys.
  if (key.length < 2 && index > 0) {
    key = normalized.slice(index - 1)
  }

  return key.slice(-6)
}

export function getPhoneticRhymeKey(
  word: string,
  language: string = DEFAULT_TTS_LANGUAGE
): string {
  const cleaned = sanitizeWord(word)
  if (!cleaned) return ''
  const languageBase = getLanguageBase(language)
  const cacheKey = `${languageBase}:${cleaned}`

  const cached = RHYME_KEY_CACHE.get(cacheKey)
  if (cached) return cached

  const key = computePhoneticRhymeKey(cleaned, languageBase)
  RHYME_KEY_CACHE.set(cacheKey, key)
  return key
}

export function doWordsRhyme(
  a: string,
  b: string,
  language: string = DEFAULT_TTS_LANGUAGE
): boolean {
  if (!a || !b) return false

  const keyA = getPhoneticRhymeKey(a, language)
  const keyB = getPhoneticRhymeKey(b, language)

  if (!keyA || !keyB) return false
  if (keyA === keyB) return true

  const min = Math.min(keyA.length, keyB.length)
  if (min < 3) return false

  return keyA.endsWith(keyB) || keyB.endsWith(keyA)
}

export function clearRhymeKeyCache(): void {
  RHYME_KEY_CACHE.clear()
}

import { describe, it, expect, beforeEach } from 'vitest'
import {
  clearRhymeKeyCache,
  doWordsRhyme,
  getPhoneticRhymeKey,
} from '@/lib/words/rhyme'

describe('rhyme helpers', () => {
  beforeEach(() => {
    clearRhymeKeyCache()
  })

  it('should treat sky and tie as rhyming', () => {
    expect(getPhoneticRhymeKey('sky')).toBe(getPhoneticRhymeKey('tie'))
    expect(doWordsRhyme('sky', 'tie')).toBe(true)
  })

  it('should treat nation and station as rhyming', () => {
    expect(doWordsRhyme('nation', 'station')).toBe(true)
  })

  it('should not force non-rhyming words into the same key', () => {
    expect(doWordsRhyme('sky', 'stone')).toBe(false)
    expect(doWordsRhyme('unique', 'station')).toBe(false)
  })

  it('should use French phonetic matching when language is fr-FR', () => {
    expect(doWordsRhyme('rime', 'crime', 'fr-FR')).toBe(true)
    expect(doWordsRhyme('rime', 'horizon', 'fr-FR')).toBe(false)
  })

  it('should use Portuguese phonetic matching when language is pt-PT', () => {
    expect(doWordsRhyme('chao', 'mao', 'pt-PT')).toBe(true)
    expect(doWordsRhyme('chao', 'ritmo', 'pt-PT')).toBe(false)
  })
})

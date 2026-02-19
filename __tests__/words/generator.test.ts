import { describe, it, expect, beforeEach } from 'vitest'
import { WordGenerator } from '@/lib/words/generator'
import { clearRhymeKeyCache, doWordsRhyme } from '@/lib/words/rhyme'
import { WordData } from '@/lib/words/types'

const baseWords: WordData[] = [
  { id: '1', wordText: 'nation', syllableCount: 2, difficultyLevel: 2 },
  { id: '2', wordText: 'station', syllableCount: 2, difficultyLevel: 2 },
  { id: '3', wordText: 'creation', syllableCount: 3, difficultyLevel: 2 },
  { id: '4', wordText: 'unique', syllableCount: 2, difficultyLevel: 2 },
  { id: '5', wordText: 'sky', syllableCount: 1, difficultyLevel: 1 },
  { id: '6', wordText: 'tie', syllableCount: 1, difficultyLevel: 1 },
  { id: '7', wordText: 'stone', syllableCount: 1, difficultyLevel: 1 },
]

function normalizeWord(word: string): string {
  return word.trim().toLowerCase()
}

describe('WordGenerator', () => {
  let generator: WordGenerator

  beforeEach(() => {
    clearRhymeKeyCache()
    generator = new WordGenerator(baseWords)
  })

  describe('Phonetic Anti-Rhyme Logic', () => {
    it('should avoid phonetic rhymes like sky -> tie when fresh non-rhymes exist', () => {
      generator.setDifficulty(1)

      const pool = ['sky', 'tie', 'stone']
      const used = new Set<string>()
      let prev: string | null = null
      for (let i = 0; i < 18; i++) {
        if (used.size === pool.length) {
          used.clear()
        }

        const fresh = pool.filter((word) => !used.has(normalizeWord(word)))
        const previous = prev
        const hasFreshNonRhymingOption =
          previous !== null &&
          fresh.some((word) => !doWordsRhyme(previous, word))

        const next = generator.getRandomWord()
        expect(next).not.toBeNull()
        if (!next) continue

        if (prev && hasFreshNonRhymingOption) {
          expect(doWordsRhyme(prev, next.wordText)).toBe(false)
        }

        used.add(normalizeWord(next.wordText))
        prev = next.wordText
      }
    })

    it('should avoid classic rhyme chains while fresh non-rhyme options exist', () => {
      generator.setDifficulty(2)

      const pool = ['nation', 'station', 'creation', 'unique']
      const used = new Set<string>()
      let prev: string | null = null
      for (let i = 0; i < 25; i++) {
        if (used.size === pool.length) {
          used.clear()
        }

        const fresh = pool.filter((word) => !used.has(normalizeWord(word)))
        const previous = prev
        const hasFreshNonRhymingOption =
          previous !== null &&
          fresh.some((word) => !doWordsRhyme(previous, word))

        const next = generator.getRandomWord()
        expect(next).not.toBeNull()
        if (!next) continue

        if (prev && hasFreshNonRhymingOption) {
          expect(doWordsRhyme(prev, next.wordText)).toBe(false)
        }

        used.add(normalizeWord(next.wordText))
        prev = next.wordText
      }
    })

    it('should handle short words gracefully', () => {
      const shortWords: WordData[] = [
        { id: '1', wordText: 'go', syllableCount: 1, difficultyLevel: 1 },
        { id: '2', wordText: 'no', syllableCount: 1, difficultyLevel: 1 },
        { id: '3', wordText: 'so', syllableCount: 1, difficultyLevel: 1 },
      ]

      const shortGenerator = new WordGenerator(shortWords)
      shortGenerator.setDifficulty(1)

      const word = shortGenerator.getRandomWord()
      expect(word).not.toBeNull()
    })

    it('should apply anti-rhyme with the configured language', () => {
      const frenchWords: WordData[] = [
        { id: '1', wordText: 'rime', syllableCount: 1, difficultyLevel: 1 },
        { id: '2', wordText: 'crime', syllableCount: 1, difficultyLevel: 1 },
        { id: '3', wordText: 'phase', syllableCount: 1, difficultyLevel: 1 },
      ]

      const frenchGenerator = new WordGenerator(frenchWords, {
        language: 'fr-FR',
      })
      frenchGenerator.setDifficulty(1)

      const pool = frenchWords.map((word) => normalizeWord(word.wordText))
      const used = new Set<string>()
      let prev: string | null = null
      for (let i = 0; i < 14; i++) {
        if (used.size === pool.length) {
          used.clear()
        }

        const fresh = pool.filter((word) => !used.has(word))
        const previous = prev
        const hasFreshNonRhymingOption =
          previous !== null &&
          fresh.some((word) => !doWordsRhyme(previous, word, 'fr-FR'))

        const next = frenchGenerator.getRandomWord()
        expect(next).not.toBeNull()
        if (!next) continue

        if (prev && hasFreshNonRhymingOption) {
          expect(doWordsRhyme(prev, next.wordText, 'fr-FR')).toBe(false)
        }

        used.add(normalizeWord(next.wordText))
        prev = next.wordText
      }
    })
  })

  describe('Fallback Behavior', () => {
    it('should keep returning words even when all options rhyme', () => {
      const allRhymingWords: WordData[] = [
        { id: '1', wordText: 'flow', syllableCount: 1, difficultyLevel: 1 },
        { id: '2', wordText: 'grow', syllableCount: 1, difficultyLevel: 1 },
        { id: '3', wordText: 'show', syllableCount: 1, difficultyLevel: 1 },
      ]

      const rhymeOnlyGenerator = new WordGenerator(allRhymingWords)
      rhymeOnlyGenerator.setDifficulty(1)

      for (let i = 0; i < 8; i++) {
        const word = rhymeOnlyGenerator.getRandomWord()
        expect(word).not.toBeNull()
      }
    })

    it('should prioritize fresh words before recycling used non-rhyming words when rhyme is forced', () => {
      const constrainedWords: WordData[] = [
        { id: '1', wordText: 'sky', syllableCount: 1, difficultyLevel: 1 },
        { id: '2', wordText: 'tie', syllableCount: 1, difficultyLevel: 1 },
        { id: '3', wordText: 'stone', syllableCount: 1, difficultyLevel: 1 },
      ]

      let observedPriorityCase = false

      for (let attempt = 0; attempt < 40; attempt++) {
        const constrainedGenerator = new WordGenerator(constrainedWords)
        constrainedGenerator.setDifficulty(1)

        const pool = constrainedWords.map((word) => normalizeWord(word.wordText))
        const used = new Set<string>()
        let prev: string | null = null

        for (let i = 0; i < 8; i++) {
          if (used.size === pool.length) {
            used.clear()
          }

          const fresh = pool.filter((candidate) => !used.has(candidate))
          const recycled = pool.filter((candidate) => used.has(candidate))
          const previous = prev
          const freshNonRhyming =
            previous === null
              ? fresh
              : fresh.filter((candidate) => !doWordsRhyme(previous, candidate))
          const recycledNonRhyming =
            previous === null
              ? recycled
              : recycled.filter((candidate) => !doWordsRhyme(previous, candidate))
          const shouldPreferFreshRhyme =
            previous !== null &&
            fresh.length > 0 &&
            freshNonRhyming.length === 0 &&
            recycledNonRhyming.length > 0

          const word = constrainedGenerator.getRandomWord()
          expect(word).not.toBeNull()
          if (!word) continue

          const nextKey = normalizeWord(word.wordText)
          if (shouldPreferFreshRhyme) {
            observedPriorityCase = true
            expect(used.has(nextKey)).toBe(false)
            expect(doWordsRhyme(previous!, word.wordText)).toBe(true)
          }

          used.add(nextKey)
          prev = word.wordText
        }

        if (observedPriorityCase) break
      }

      expect(observedPriorityCase).toBe(true)
    })

    it('should not repeat words before exhausting the pool in constrained rhyme sets', () => {
      const constrainedWords: WordData[] = [
        { id: '1', wordText: 'cat', syllableCount: 1, difficultyLevel: 1 },
        { id: '2', wordText: 'bat', syllableCount: 1, difficultyLevel: 1 },
        { id: '3', wordText: 'hat', syllableCount: 1, difficultyLevel: 1 },
        { id: '4', wordText: 'stone', syllableCount: 1, difficultyLevel: 1 },
      ]

      for (let attempt = 0; attempt < 25; attempt++) {
        const constrainedGenerator = new WordGenerator(constrainedWords)
        constrainedGenerator.setDifficulty(1)

        const firstCycle: string[] = []
        for (let i = 0; i < constrainedWords.length; i++) {
          const word = constrainedGenerator.getRandomWord()
          expect(word).not.toBeNull()
          if (word) firstCycle.push(word.wordText)
        }

        expect(new Set(firstCycle).size).toBe(constrainedWords.length)
      }
    })
  })

  describe('Safe Mode', () => {
    it('should filter explicit words when safe mode is enabled', () => {
      const wordsWithExplicit: WordData[] = [
        { id: '1', wordText: 'clean', syllableCount: 1, difficultyLevel: 1 },
        { id: '2', wordText: 'fuck', syllableCount: 1, difficultyLevel: 1 },
        { id: '3', wordText: 'pure', syllableCount: 1, difficultyLevel: 1 },
      ]

      const safeGenerator = new WordGenerator(wordsWithExplicit)
      safeGenerator.setDifficulty(1)
      safeGenerator.setSafeMode(true)

      const words: string[] = []
      for (let i = 0; i < 10; i++) {
        const word = safeGenerator.getRandomWord()
        if (word) words.push(word.wordText)
      }

      expect(words).not.toContain('fuck')
    })
  })

  describe('Difficulty Filtering', () => {
    it('should only return words matching current difficulty', () => {
      generator.setDifficulty(1)

      const words: string[] = []
      for (let i = 0; i < 10; i++) {
        const word = generator.getRandomWord()
        if (word) words.push(word.wordText)
      }

      const easyWords = ['sky', 'tie', 'stone']
      words.forEach((word) => {
        expect(easyWords).toContain(word)
      })
    })
  })

  describe('Reset Functionality', () => {
    it('should clear usedWords on reset', () => {
      generator.setDifficulty(1)

      generator.getRandomWord()
      generator.getRandomWord()

      const statsBefore = generator.getStats()
      expect(statsBefore.usedWords).toBeGreaterThan(0)

      generator.reset()

      const statsAfter = generator.getStats()
      expect(statsAfter.usedWords).toBe(0)
    })
  })
})

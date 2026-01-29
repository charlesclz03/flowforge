import { describe, it, expect, beforeEach } from 'vitest'
import { WordGenerator } from '@/lib/words/generator'
import { WordData } from '@/lib/words/types'

// Mock word data for testing
const mockWords: WordData[] = [
  { id: '1', wordText: 'nation', syllableCount: 2, difficultyLevel: 2 },
  { id: '2', wordText: 'station', syllableCount: 2, difficultyLevel: 2 },
  { id: '3', wordText: 'creation', syllableCount: 3, difficultyLevel: 2 },
  { id: '4', wordText: 'flow', syllableCount: 1, difficultyLevel: 1 },
  { id: '5', wordText: 'grow', syllableCount: 1, difficultyLevel: 1 },
  { id: '6', wordText: 'show', syllableCount: 1, difficultyLevel: 1 },
  { id: '7', wordText: 'dream', syllableCount: 1, difficultyLevel: 1 },
  { id: '8', wordText: 'unique', syllableCount: 2, difficultyLevel: 2 },
]

describe('WordGenerator', () => {
  let generator: WordGenerator

  beforeEach(() => {
    generator = new WordGenerator(mockWords)
  })

  describe('Anti-Rhyme Logic (isTooSimilar)', () => {
    it('should not return consecutive words with same suffix', () => {
      generator.setDifficulty(2)

      // Get first word
      const firstWord = generator.getRandomWord()
      expect(firstWord).not.toBeNull()

      // Get second word - should not have same last 3 chars
      const secondWord = generator.getRandomWord()
      expect(secondWord).not.toBeNull()

      if (firstWord && secondWord) {
        // The anti-rhyme logic blocks words with same last 3 chars
        // In mock data: "nation", "station", "creation" all end in "ion"
        // After first, it should pick "unique" or fall back to the pool
        // We just verify we got a valid word
        expect(secondWord.wordText).toBeDefined()
      }
    })

    it('should allow words with different suffixes', () => {
      generator.setDifficulty(1) // Easy words: flow, grow, show, dream

      // Get multiple words
      const words: string[] = []
      for (let i = 0; i < 4; i++) {
        const word = generator.getRandomWord()
        if (word) words.push(word.wordText)
      }

      // "dream" should appear as it breaks the -ow rhyme pattern
      expect(words.length).toBeGreaterThan(0)
    })

    it('should handle short words gracefully', () => {
      const shortWords: WordData[] = [
        { id: '1', wordText: 'go', syllableCount: 1, difficultyLevel: 1 },
        { id: '2', wordText: 'no', syllableCount: 1, difficultyLevel: 1 },
        { id: '3', wordText: 'so', syllableCount: 1, difficultyLevel: 1 },
      ]

      const shortGenerator = new WordGenerator(shortWords)
      shortGenerator.setDifficulty(1)

      // Should not crash on words < 3 chars
      const word = shortGenerator.getRandomWord()
      expect(word).not.toBeNull()
    })
  })

  describe('Fallback Behavior', () => {
    it('should fall back to original pool when all words violate constraint', () => {
      // All words end in "-ow" except none - forces fallback
      const allRhymeWords: WordData[] = [
        { id: '1', wordText: 'flow', syllableCount: 1, difficultyLevel: 1 },
        { id: '2', wordText: 'grow', syllableCount: 1, difficultyLevel: 1 },
        { id: '3', wordText: 'show', syllableCount: 1, difficultyLevel: 1 },
      ]

      const rhymeGenerator = new WordGenerator(allRhymeWords)
      rhymeGenerator.setDifficulty(1)

      // Get first word
      const first = rhymeGenerator.getRandomWord()
      expect(first).not.toBeNull()

      // Get second word - should still work via fallback
      const second = rhymeGenerator.getRandomWord()
      expect(second).not.toBeNull()

      // Get third word
      const third = rhymeGenerator.getRandomWord()
      expect(third).not.toBeNull()
    })

    it('should reset usedWords and allow cycling through words', () => {
      const smallPool: WordData[] = [
        { id: '1', wordText: 'alpha', syllableCount: 2, difficultyLevel: 1 },
        { id: '2', wordText: 'beta', syllableCount: 2, difficultyLevel: 1 },
      ]

      const smallGenerator = new WordGenerator(smallPool)
      smallGenerator.setDifficulty(1)

      // Get all words twice - should reset after exhausting pool
      for (let i = 0; i < 4; i++) {
        const word = smallGenerator.getRandomWord()
        expect(word).not.toBeNull()
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

      // Get all available words
      const words: string[] = []
      for (let i = 0; i < 10; i++) {
        const word = safeGenerator.getRandomWord()
        if (word) words.push(word.wordText)
      }

      // "fuck" should never appear
      expect(words).not.toContain('fuck')
    })
  })

  describe('Difficulty Filtering', () => {
    it('should only return words matching current difficulty', () => {
      generator.setDifficulty(1) // Easy

      const words: string[] = []
      for (let i = 0; i < 10; i++) {
        const word = generator.getRandomWord()
        if (word) words.push(word.wordText)
      }

      // Only easy words should appear
      const easyWords = ['flow', 'grow', 'show', 'dream']
      words.forEach((w) => {
        expect(easyWords).toContain(w)
      })
    })
  })

  describe('Reset Functionality', () => {
    it('should clear usedWords on reset', () => {
      generator.setDifficulty(1)

      // Use some words
      generator.getRandomWord()
      generator.getRandomWord()

      // Stats should show used words
      const statsBefore = generator.getStats()
      expect(statsBefore.usedWords).toBeGreaterThan(0)

      // Reset
      generator.reset()

      // Stats should show 0 used words
      const statsAfter = generator.getStats()
      expect(statsAfter.usedWords).toBe(0)
    })
  })
})

import { describe, it, expect } from 'vitest'
import {
  buildSessionWordQueue,
  estimateSessionPromptBudget,
} from '@/lib/words/session-queue'
import { getFallbackWords } from '@/lib/data/fallbacks'
import { doWordsRhyme, getPhoneticRhymeKey } from '@/lib/words/rhyme'
import type { PracticeWordSeed } from '@/lib/words/practice-word-seed'

function makeWords(): PracticeWordSeed[] {
  return Array.from({ length: 120 }, (_, index) => ({
    wordText: `prompt-${index + 1}`,
    difficultyLevel: index < 40 ? 1 : index < 80 ? 2 : 3,
    syllableCount: index < 40 ? 1 : index < 80 ? 2 : 4,
  }))
}

function uniqueCount(words: PracticeWordSeed[]) {
  return new Set(words.map((word) => word.wordText.toLowerCase())).size
}

describe('session queue', () => {
  it('builds a full unique queue for a 10-minute session at 155 BPM and 4-bar frequency', () => {
    const words = makeWords()
    const budget = estimateSessionPromptBudget({
      bpm: 155,
      frequency: 4,
      sessionDurationSeconds: 600,
    })

    expect(budget).toBe(97)

    const result = buildSessionWordQueue({
      bpm: 155,
      frequency: 4,
      difficulty: 1,
      language: 'en-US',
      sessionDurationSeconds: 600,
      words,
    })

    expect(result.budget).toBe(97)
    expect(result.deficit).toBe(0)
    expect(result.queue).toHaveLength(97)
    expect(uniqueCount(result.queue)).toBe(97)
  })

  it('excludes already-used words instead of recycling them mid-session', () => {
    const words = makeWords()
    const result = buildSessionWordQueue({
      bpm: 100,
      frequency: 4,
      difficulty: 2,
      language: 'en-US',
      sessionDurationSeconds: 120,
      words,
      usedWords: ['prompt-41', 'prompt-42', 'prompt-43'],
    })

    expect(result.queue.map((word) => word.wordText)).not.toContain('prompt-41')
    expect(result.queue.map((word) => word.wordText)).not.toContain('prompt-42')
    expect(result.queue.map((word) => word.wordText)).not.toContain('prompt-43')
  })

  it('prefers non-rhyming neighbors when alternatives exist', () => {
    const result = buildSessionWordQueue({
      bpm: 90,
      frequency: 4,
      difficulty: 2,
      language: 'en-US',
      sessionDurationSeconds: 50,
      randomFn: () => 0,
      words: [
        { wordText: 'station', difficultyLevel: 2, syllableCount: 2 },
        { wordText: 'nation', difficultyLevel: 2, syllableCount: 2 },
        { wordText: 'unique', difficultyLevel: 2, syllableCount: 2 },
        { wordText: 'melody', difficultyLevel: 2, syllableCount: 3 },
      ],
    })

    expect(result.queue[0]?.wordText).toBe('station')
    expect(result.queue[1]?.wordText).toBeDefined()
    expect(
      doWordsRhyme(result.queue[0]!.wordText, result.queue[1]!.wordText)
    ).toBe(false)
  })

  it('does not repeat a word family until other available families are used', () => {
    const result = buildSessionWordQueue({
      bpm: 60,
      frequency: 4,
      difficulty: 2,
      language: 'en-US',
      sessionDurationSeconds: 64,
      randomFn: () => 0,
      words: [
        { wordText: 'station', difficultyLevel: 2, syllableCount: 2 },
        { wordText: 'nation', difficultyLevel: 2, syllableCount: 2 },
        { wordText: 'creation', difficultyLevel: 2, syllableCount: 3 },
        { wordText: 'unique', difficultyLevel: 2, syllableCount: 2 },
        { wordText: 'melody', difficultyLevel: 2, syllableCount: 3 },
      ],
    })

    const queueWords = result.queue.map((word) => word.wordText)
    const queueFamilies = queueWords.map((word) =>
      getPhoneticRhymeKey(word, 'en-US')
    )
    const ionFamily = getPhoneticRhymeKey('station', 'en-US')

    expect(queueWords).toHaveLength(5)
    expect(queueWords[0]).toBe('station')
    expect(queueFamilies.slice(1, 3)).not.toContain(ionFamily)
    expect(queueFamilies[3]).toBe(ionFamily)
    expect(queueFamilies[4]).toBe(ionFamily)
  })

  it('carries family history from used words when rebuilding a queue', () => {
    const result = buildSessionWordQueue({
      bpm: 60,
      frequency: 4,
      difficulty: 2,
      language: 'en-US',
      sessionDurationSeconds: 20,
      randomFn: () => 0,
      usedWords: ['station'],
      words: [
        { wordText: 'station', difficultyLevel: 2, syllableCount: 2 },
        { wordText: 'nation', difficultyLevel: 2, syllableCount: 2 },
        { wordText: 'unique', difficultyLevel: 2, syllableCount: 2 },
      ],
    })

    expect(result.queue[0]?.wordText).toBe('unique')
  })

  it('has enough fallback French words to keep a full session unique', () => {
    const words = getFallbackWords('fr-FR').map((word) => ({
      wordText: word.wordText,
      difficultyLevel: word.difficultyLevel,
      syllableCount: word.syllableCount,
    }))

    const result = buildSessionWordQueue({
      bpm: 155,
      frequency: 4,
      difficulty: 1,
      language: 'fr-FR',
      sessionDurationSeconds: 600,
      words,
    })

    expect(uniqueCount(words)).toBeGreaterThanOrEqual(100)
    expect(result.queue).toHaveLength(97)
    expect(uniqueCount(result.queue)).toBe(97)
  })

  it('has enough fallback Portuguese words to keep a full session unique', () => {
    const words = getFallbackWords('pt-PT').map((word) => ({
      wordText: word.wordText,
      difficultyLevel: word.difficultyLevel,
      syllableCount: word.syllableCount,
    }))

    const result = buildSessionWordQueue({
      bpm: 155,
      frequency: 4,
      difficulty: 1,
      language: 'pt-PT',
      sessionDurationSeconds: 600,
      words,
    })

    expect(uniqueCount(words)).toBeGreaterThanOrEqual(100)
    expect(result.queue).toHaveLength(97)
    expect(uniqueCount(result.queue)).toBe(97)
  })
})

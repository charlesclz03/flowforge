import { WordData } from './types'
import { filterByDifficulty, getRandomWords } from './utils'

/**
 * Word Generator class for managing word selection
 */
export class WordGenerator {
  private words: WordData[]
  private usedWords: Set<string> = new Set()
  private currentDifficulty: number = 2
  private safeMode: boolean = false
  private lastWord: string | null = null

  constructor(words: WordData[]) {
    this.words = words
  }

  /**
   * Set safe mode
   */
  setSafeMode(enabled: boolean): void {
    this.safeMode = enabled
    this.usedWords.clear()
    this.lastWord = null
  }

  /**
   * Set difficulty level
   */
  setDifficulty(difficulty: number): void {
    this.currentDifficulty = difficulty
    this.usedWords.clear() // Reset when difficulty changes
    this.lastWord = null
  }

  /**
   * Get available words for current difficulty
   */
  private getAvailableWords(): WordData[] {
    let difficultyWords = filterByDifficulty(this.words, this.currentDifficulty)

    if (this.safeMode) {
      const explicitWords = ['fuck', 'shit', 'bitch', 'damn']
      difficultyWords = difficultyWords.filter(
        (w) =>
          !explicitWords.some((explicit) =>
            w.wordText.toLowerCase().includes(explicit)
          )
      )
    }

    // Filter out recently used words
    return difficultyWords.filter((w) => !this.usedWords.has(w.wordText))
  }

  /**
   * Check if a candidate word rhymes too perfectly with the last word
   * Rules:
   * 1. Match last 3 characters (e.g. -ation, -ing, -ght)
   */
  private isTooSimilar(candidate: string): boolean {
    if (!this.lastWord) return false

    // Safety check for short words
    if (this.lastWord.length < 3 || candidate.length < 3) return false

    const lastSuffix = this.lastWord.slice(-3).toLowerCase()
    const candidateSuffix = candidate.slice(-3).toLowerCase()

    return lastSuffix === candidateSuffix
  }

  /**
   * Get a random word
   */
  getRandomWord(): WordData | null {
    let available = this.getAvailableWords()

    // If all words have been used, reset and try again
    if (available.length === 0) {
      this.usedWords.clear()
      available = this.getAvailableWords()
    }

    if (available.length === 0) {
      return null // No words available for this difficulty
    }

    // Apply anti-rhyme/anti-flow constraints
    // Filter out words that are too similar to the last one
    const constrained = available.filter((w) => !this.isTooSimilar(w.wordText))

    // Fallback: If all available words violate constraints (unlikely but possible),
    // use the original available list to prevent jamming.
    const pool = constrained.length > 0 ? constrained : available

    const selected = getRandomWords(pool, 1)[0]

    this.usedWords.add(selected.wordText)
    this.lastWord = selected.wordText

    return selected
  }

  /**
   * Get multiple random words
   */
  getRandomWords(count: number): WordData[] {
    const result: WordData[] = []

    for (let i = 0; i < count; i++) {
      const word = this.getRandomWord()
      if (word) {
        result.push(word)
      }
    }

    return result
  }

  /**
   * Reset the generator
   */
  reset(): void {
    this.usedWords.clear()
    this.lastWord = null
  }

  /**
   * Get statistics
   */
  getStats() {
    const difficultyWords = filterByDifficulty(
      this.words,
      this.currentDifficulty
    )

    return {
      totalWords: this.words.length,
      availableForDifficulty: difficultyWords.length,
      usedWords: this.usedWords.size,
      currentDifficulty: this.currentDifficulty,
    }
  }
}

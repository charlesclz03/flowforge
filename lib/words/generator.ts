import { WordData } from './types'
import { filterByDifficulty, getRandomWords } from './utils'

/**
 * Word Generator class for managing word selection
 */
export class WordGenerator {
  private words: WordData[]
  private usedWords: Set<string> = new Set()
  private currentDifficulty: number = 2

  constructor(words: WordData[]) {
    this.words = words
  }

  /**
   * Set difficulty level
   */
  setDifficulty(difficulty: number): void {
    this.currentDifficulty = difficulty
    this.usedWords.clear() // Reset when difficulty changes
  }

  /**
   * Get available words for current difficulty
   */
  private getAvailableWords(): WordData[] {
    const difficultyWords = filterByDifficulty(this.words, this.currentDifficulty)

    // Filter out recently used words
    return difficultyWords.filter((w) => !this.usedWords.has(w.wordText))
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

    const selected = getRandomWords(available, 1)[0]
    this.usedWords.add(selected.wordText)

    // Keep usedWords set from growing too large
    if (this.usedWords.size > 20) {
      const toRemove = Array.from(this.usedWords)[0]
      this.usedWords.delete(toRemove)
    }

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
  }

  /**
   * Get statistics
   */
  getStats() {
    const difficultyWords = filterByDifficulty(this.words, this.currentDifficulty)

    return {
      totalWords: this.words.length,
      availableForDifficulty: difficultyWords.length,
      usedWords: this.usedWords.size,
      currentDifficulty: this.currentDifficulty,
    }
  }
}


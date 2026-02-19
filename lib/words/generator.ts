import { WordData } from './types'
import { filterByDifficulty, getRandomWords } from './utils'
import { doWordsRhyme } from './rhyme'
import { DEFAULT_TTS_LANGUAGE, resolveLanguageCode } from '@/lib/tts/languages'

interface WordGeneratorOptions {
  language?: string
}

/**
 * Word Generator class for managing word selection
 */
export class WordGenerator {
  private words: WordData[]
  private usedWords: Set<string> = new Set()
  private currentDifficulty: number = 2
  private safeMode: boolean = false
  private lastWord: string | null = null
  private language: string = DEFAULT_TTS_LANGUAGE

  constructor(words: WordData[], options?: WordGeneratorOptions) {
    this.words = words
    this.language = resolveLanguageCode(options?.language)
  }

  /**
   * Get words available for the current difficulty + safety mode, before anti-repeat filtering.
   */
  private getDifficultyWords(): WordData[] {
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

    return difficultyWords
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
   * Set active language for anti-rhyme checks.
   * Resets anti-repeat memory to avoid cross-language carry-over.
   */
  setLanguage(language: string): void {
    const resolved = resolveLanguageCode(language)
    if (resolved === this.language) return

    this.language = resolved
    this.usedWords.clear()
    this.lastWord = null
  }

  private getWordKey(word: string): string {
    return word.trim().toLowerCase()
  }

  /**
   * Get available words for current difficulty
   */
  private getAvailableWords(): WordData[] {
    const difficultyWords = this.getDifficultyWords()
    return difficultyWords.filter(
      (w) => !this.usedWords.has(this.getWordKey(w.wordText))
    )
  }

  /**
   * Check if a candidate word is too close to the previous prompt.
   * Uses phonetic rhyme matching instead of raw suffix matching.
   */
  private isTooSimilar(candidate: string): boolean {
    if (!this.lastWord) return false
    return doWordsRhyme(this.lastWord, candidate, this.language)
  }

  /**
   * Get a random word
   */
  getRandomWord(): WordData | null {
    const allDifficultyWords = this.getDifficultyWords()
    let available = this.getAvailableWords()

    // If all words have been used, reset and try again
    if (available.length === 0) {
      this.usedWords.clear()
      available = this.getAvailableWords()
    }

    if (allDifficultyWords.length === 0) {
      return null // No words available for this difficulty
    }

    // Pass A: Prefer unused words that do not rhyme with the previous prompt.
    const freshNonRhyming = available.filter(
      (w) => !this.isTooSimilar(w.wordText)
    )

    // Pass B: Keep anti-repeat priority and allow fresh rhymes before recycling words.
    const freshRhyming = available.filter((w) => this.isTooSimilar(w.wordText))

    // Pass C: Recycle used words only when needed, still preferring anti-rhyme.
    const usedNonRhyming = allDifficultyWords.filter(
      (w) =>
        this.usedWords.has(this.getWordKey(w.wordText)) &&
        !this.isTooSimilar(w.wordText)
    )

    // Pass D: Last-resort used pool when every other guard is exhausted.
    const usedAny = allDifficultyWords.filter((w) =>
      this.usedWords.has(this.getWordKey(w.wordText))
    )

    // Retained as an ultimate non-jamming guard.
    const anyNonRhyming = allDifficultyWords.filter(
      (w) => !this.isTooSimilar(w.wordText)
    )

    // Pool order keeps fresh words ahead of recycled words.
    const pool =
      freshNonRhyming.length > 0
        ? freshNonRhyming
        : freshRhyming.length > 0
          ? freshRhyming
          : usedNonRhyming.length > 0
            ? usedNonRhyming
            : usedAny.length > 0
              ? usedAny
              : anyNonRhyming.length > 0
                ? anyNonRhyming
                : available.length > 0
                  ? available
                  : allDifficultyWords

    const selected = getRandomWords(pool, 1)[0]

    this.usedWords.add(this.getWordKey(selected.wordText))
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

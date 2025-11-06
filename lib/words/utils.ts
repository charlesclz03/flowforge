/**
 * Count syllables in a word (simple algorithm)
 * This is a basic implementation - production would use a more sophisticated library
 */
export function countSyllables(word: string): number {
  word = word.toLowerCase().trim()
  if (word.length <= 3) return 1

  // Remove trailing 'e' and 'es'/'ed' if preceded by consonant
  word = word.replace(/(?:[^laeiouy]es?|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')

  // Count vowel groups
  const matches = word.match(/[aeiouy]{1,2}/g)
  const syllables = matches ? matches.length : 1

  return Math.max(syllables, 1)
}

/**
 * Determine difficulty level based on syllable count
 */
export function getDifficultyFromSyllables(syllableCount: number): number {
  if (syllableCount <= 2) return 1 // Easy
  if (syllableCount <= 3) return 2 // Medium
  return 3 // Hard
}

/**
 * Filter words by difficulty range
 */
export function filterByDifficulty<T extends { difficultyLevel: number }>(
  words: T[],
  difficulty: number
): T[] {
  return words.filter((w) => w.difficultyLevel === difficulty)
}

/**
 * Get random words from a list
 */
export function getRandomWords<T>(words: T[], count: number): T[] {
  const shuffled = [...words].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Validate word (basic checks)
 */
export function isValidWord(word: string): boolean {
  if (!word || typeof word !== 'string') return false
  if (word.length < 2) return false
  if (!/^[a-zA-Z]+$/.test(word)) return false // Only letters
  return true
}

/**
 * Capitalize word for display
 */
export function capitalizeWord(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

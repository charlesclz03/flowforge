import { doWordsRhyme, getPhoneticRhymeKey } from '@/lib/words/rhyme'
import type { PracticeWordSeed } from '@/lib/words/practice-word-seed'

interface SessionQueueOptions {
  bpm: number
  frequency: number
  difficulty: number
  language: string
  sessionDurationSeconds: number
  words: PracticeWordSeed[]
  usedWords?: string[]
  randomFn?: () => number
}

export interface SessionQueueResult {
  queue: PracticeWordSeed[]
  budget: number
  deficit: number
}

function normalizeWordKey(word: string): string {
  return word.trim().toLowerCase()
}

function getWordFamilyKey(
  word: string,
  language: string,
  fallbackKey: string
): string {
  return getPhoneticRhymeKey(word, language) || fallbackKey
}

function difficultyOrder(difficulty: number): number[] {
  if (difficulty === 1) return [1, 2, 3]
  if (difficulty === 2) return [2, 1, 3]
  if (difficulty === 3) return [3, 2, 1]
  return [1, 2, 3]
}

function pickRandomIndex(length: number, randomFn: () => number): number {
  if (length <= 1) return 0
  return Math.max(0, Math.min(length - 1, Math.floor(randomFn() * length)))
}

function dedupeSeeds(words: PracticeWordSeed[]): PracticeWordSeed[] {
  const seen = new Set<string>()
  const deduped: PracticeWordSeed[] = []

  for (const word of words) {
    const wordText = word.wordText?.trim()
    if (!wordText) continue

    const key = normalizeWordKey(wordText)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push({
      ...word,
      wordText,
    })
  }

  return deduped
}

export function estimateSessionPromptBudget({
  bpm,
  frequency,
  sessionDurationSeconds,
}: Pick<SessionQueueOptions, 'bpm' | 'frequency' | 'sessionDurationSeconds'>) {
  if (bpm <= 0 || frequency <= 0 || sessionDurationSeconds <= 0) {
    return 1
  }

  const secondsPerPrompt = (60 / bpm) * 4 * frequency
  return Math.max(1, Math.floor(sessionDurationSeconds / secondsPerPrompt) + 1)
}

export function buildSessionWordQueue({
  bpm,
  frequency,
  difficulty,
  language,
  sessionDurationSeconds,
  words,
  usedWords = [],
  randomFn = Math.random,
}: SessionQueueOptions): SessionQueueResult {
  const budget = estimateSessionPromptBudget({
    bpm,
    frequency,
    sessionDurationSeconds,
  })
  const usedSet = new Set(usedWords.map(normalizeWordKey))
  const available = dedupeSeeds(words).filter(
    (seed) => !usedSet.has(normalizeWordKey(seed.wordText))
  )
  const priority = difficultyOrder(difficulty)
  const remaining = new Map<number, PracticeWordSeed[]>(
    priority.map((level) => [
      level,
      available.filter((seed) => (seed.difficultyLevel || 2) === level),
    ])
  )
  const queue: PracticeWordSeed[] = []
  const usedFamilyCycle = new Set(
    usedWords
      .map((word) => getWordFamilyKey(word, language, normalizeWordKey(word)))
      .filter(Boolean)
  )
  let previousWord =
    usedWords.length > 0 ? usedWords[usedWords.length - 1] : null

  while (queue.length < budget) {
    const nextBucket = priority.find(
      (level) => (remaining.get(level) || []).length > 0
    )

    if (!nextBucket) break

    const bucket = remaining.get(nextBucket) || []
    const bucketFamilies = new Set(
      bucket.map((seed) =>
        getWordFamilyKey(
          seed.wordText,
          language,
          normalizeWordKey(seed.wordText)
        )
      )
    )

    if (
      bucketFamilies.size > 0 &&
      [...bucketFamilies].every((family) => usedFamilyCycle.has(family))
    ) {
      bucketFamilies.forEach((family) => usedFamilyCycle.delete(family))
    }

    const previousPrompt = previousWord
    const nonRhyming = (seed: PracticeWordSeed) =>
      !previousPrompt || !doWordsRhyme(previousPrompt, seed.wordText, language)
    const unusedFamily = (seed: PracticeWordSeed) =>
      !usedFamilyCycle.has(
        getWordFamilyKey(
          seed.wordText,
          language,
          normalizeWordKey(seed.wordText)
        )
      )
    const nonRhymingUnusedFamily = bucket.filter(
      (seed) => nonRhyming(seed) && unusedFamily(seed)
    )
    const unusedFamilyWords = bucket.filter(unusedFamily)
    const nonRhymingWords = bucket.filter(nonRhyming)
    const source =
      nonRhymingUnusedFamily.length > 0
        ? nonRhymingUnusedFamily
        : unusedFamilyWords.length > 0
          ? unusedFamilyWords
          : nonRhymingWords.length > 0
            ? nonRhymingWords
            : bucket
    const nextIndex = pickRandomIndex(source.length, randomFn)
    const selected = source[nextIndex]
    const selectedKey = normalizeWordKey(selected.wordText)
    const selectedFamily = getWordFamilyKey(
      selected.wordText,
      language,
      selectedKey
    )
    const remainingBucket = bucket.filter(
      (seed) => normalizeWordKey(seed.wordText) !== selectedKey
    )

    remaining.set(nextBucket, remainingBucket)
    if (selectedFamily) {
      usedFamilyCycle.add(selectedFamily)
    }
    queue.push(selected)
    previousWord = selected.wordText
  }

  return {
    queue,
    budget,
    deficit: Math.max(0, budget - queue.length),
  }
}

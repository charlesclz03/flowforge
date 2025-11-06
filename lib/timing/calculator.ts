import { calculateBeatTiming } from '@/lib/beats/utils'

/**
 * Calculate the time interval between word prompts
 */
export function calculatePromptInterval(bpm: number, frequencyInBars: number): number {
  const timing = calculateBeatTiming(bpm)
  return timing.secondsPerBar * frequencyInBars
}

/**
 * Check if current time aligns with a prompt interval
 */
export function shouldTriggerPrompt(
  currentTime: number,
  bpm: number,
  frequencyInBars: number,
  tolerance: number = 0.1
): boolean {
  const interval = calculatePromptInterval(bpm, frequencyInBars)

  if (currentTime === 0) return false // Don't trigger at the very start

  const nearestInterval = Math.round(currentTime / interval) * interval
  const difference = Math.abs(currentTime - nearestInterval)

  return difference <= tolerance && nearestInterval > 0
}

/**
 * Get the next prompt time from current time
 */
export function getNextPromptTime(
  currentTime: number,
  bpm: number,
  frequencyInBars: number
): number {
  const interval = calculatePromptInterval(bpm, frequencyInBars)
  const currentInterval = Math.floor(currentTime / interval)
  return (currentInterval + 1) * interval
}

/**
 * Calculate time until next prompt
 */
export function getTimeUntilNextPrompt(
  currentTime: number,
  bpm: number,
  frequencyInBars: number
): number {
  const nextPromptTime = getNextPromptTime(currentTime, bpm, frequencyInBars)
  return Math.max(0, nextPromptTime - currentTime)
}

/**
 * Get progress to next prompt (0 to 1)
 */
export function getProgressToNextPrompt(
  currentTime: number,
  bpm: number,
  frequencyInBars: number
): number {
  const interval = calculatePromptInterval(bpm, frequencyInBars)
  const progress = (currentTime % interval) / interval
  return Math.min(progress, 1)
}

/**
 * Calculate total expected prompts for a duration
 */
export function calculateExpectedPrompts(
  durationSeconds: number,
  bpm: number,
  frequencyInBars: number
): number {
  const interval = calculatePromptInterval(bpm, frequencyInBars)
  return Math.floor(durationSeconds / interval)
}

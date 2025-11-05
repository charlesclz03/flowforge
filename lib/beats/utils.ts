import { BeatTiming } from './types'
import { TIMING } from '@/lib/constants/design'

/**
 * Calculate timing information for a beat
 */
export function calculateBeatTiming(
  bpm: number,
  beatsPerBar: number = TIMING.BEATS_PER_BAR
): BeatTiming {
  const secondsPerBeat = TIMING.SECONDS_PER_MINUTE / bpm
  const secondsPerBar = secondsPerBeat * beatsPerBar

  return {
    bpm,
    beatsPerBar,
    barsPerPhrase: 4, // Standard phrase length
    secondsPerBeat,
    secondsPerBar,
  }
}

/**
 * Calculate when the next word prompt should appear
 */
export function calculateNextPromptTime(
  currentTime: number,
  bpm: number,
  frequencyInBars: number,
  beatsPerBar: number = TIMING.BEATS_PER_BAR
): number {
  const timing = calculateBeatTiming(bpm, beatsPerBar)
  const secondsPerFrequency = timing.secondsPerBar * frequencyInBars

  // Find the next interval boundary
  const currentInterval = Math.floor(currentTime / secondsPerFrequency)
  const nextIntervalStart = (currentInterval + 1) * secondsPerFrequency

  return nextIntervalStart
}

/**
 * Check if we're on a beat boundary (for visual feedback)
 */
export function isOnBeat(
  currentTime: number,
  bpm: number,
  tolerance: number = 0.05
): boolean {
  const timing = calculateBeatTiming(bpm)
  const currentBeat = currentTime / timing.secondsPerBeat
  const nearestBeat = Math.round(currentBeat)
  const difference = Math.abs(currentBeat - nearestBeat)

  return difference <= tolerance
}

/**
 * Get the current bar number
 */
export function getCurrentBar(
  currentTime: number,
  bpm: number,
  beatsPerBar: number = TIMING.BEATS_PER_BAR
): number {
  const timing = calculateBeatTiming(bpm, beatsPerBar)
  return Math.floor(currentTime / timing.secondsPerBar) + 1
}

/**
 * Calculate progress within the current frequency interval (0 to 1)
 */
export function getIntervalProgress(
  currentTime: number,
  bpm: number,
  frequencyInBars: number,
  beatsPerBar: number = TIMING.BEATS_PER_BAR
): number {
  const timing = calculateBeatTiming(bpm, beatsPerBar)
  const secondsPerFrequency = timing.secondsPerBar * frequencyInBars

  const progress = (currentTime % secondsPerFrequency) / secondsPerFrequency

  return Math.min(progress, 1)
}

/**
 * Format BPM for display
 */
export function formatBPM(bpm: number): string {
  return `${bpm} BPM`
}

/**
 * Get beat category based on BPM
 */
export function getBeatCategory(bpm: number): string {
  if (bpm < 85) return 'Slow'
  if (bpm < 110) return 'Medium'
  if (bpm < 140) return 'Fast'
  return 'Very Fast'
}


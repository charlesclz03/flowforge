import { WordData } from '@/lib/words/types'
import { calculatePromptInterval } from './calculator'

/**
 * Word Prompt Scheduler for managing timed word displays
 */
export class WordPromptScheduler {
  private bpm: number
  private activeFrequencyInBars: number
  private nextFrequencyInBars: number
  private lastPromptTime: number = -1
  private onPromptCallback: ((word: WordData) => void) | null = null

  constructor(bpm: number, frequencyInBars: number) {
    this.bpm = bpm
    this.activeFrequencyInBars = frequencyInBars
    this.nextFrequencyInBars = frequencyInBars
  }

  /**
   * Update BPM
   */
  setBPM(bpm: number): void {
    this.bpm = bpm
  }

  /**
   * Queue a frequency update for the next cycle.
   * The new frequency will be applied when the current interval completes,
   * ensuring smooth transitions without visual or audio jumps.
   * @param frequencyInBars - Number of bars between word prompts (e.g., 2, 4, 8)
   */
  setFrequency(frequencyInBars: number): void {
    this.nextFrequencyInBars = frequencyInBars
  }

  /**
   * Get the currently active frequency (what the beat is running on).
   * This may differ from the queued frequency if a change is pending.
   * @returns The active frequency in bars
   */
  getActiveFrequency(): number {
    return this.activeFrequencyInBars
  }

  /**
   * Set callback for when a prompt should be shown
   */
  onPrompt(callback: (word: WordData) => void): void {
    this.onPromptCallback = callback
  }

  /**
   * Check if a prompt should trigger at the current time and execute if so.
   * This method also commits any queued frequency changes at the start of new intervals.
   * @param currentTime - Current playback time in seconds
   * @param word - The word to display if triggered
   * @returns true if a prompt was triggered, false otherwise
   */
  checkAndTrigger(currentTime: number, word: WordData): boolean {
    const interval = calculatePromptInterval(
      this.bpm,
      this.activeFrequencyInBars
    )

    // Calculate which interval we're in
    const currentInterval = Math.floor(currentTime / interval)
    const intervalStartTime = currentInterval * interval

    // Check if we've crossed into a new interval
    const hasNewInterval =
      currentInterval > Math.floor(this.lastPromptTime / interval)

    if (hasNewInterval && intervalStartTime > 0) {
      this.lastPromptTime = currentTime

      // Commit queued frequency change
      if (this.nextFrequencyInBars !== this.activeFrequencyInBars) {
        this.activeFrequencyInBars = this.nextFrequencyInBars
      }

      if (this.onPromptCallback) {
        this.onPromptCallback(word)
      }

      return true
    }

    return false
  }

  /**
   * Reset the scheduler
   */
  reset(): void {
    this.lastPromptTime = -1
    // Optional: Reset active to match next on full stop?
    // For now, keep them synced
    this.activeFrequencyInBars = this.nextFrequencyInBars
  }

  /**
   * Get interval duration based on ACTIVE frequency
   */
  getInterval(): number {
    return calculatePromptInterval(this.bpm, this.activeFrequencyInBars)
  }
}

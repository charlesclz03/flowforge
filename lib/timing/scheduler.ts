import { WordData } from '@/lib/words/types'
import { calculatePromptInterval } from './calculator'

/**
 * Word Prompt Scheduler for managing timed word displays
 */
export class WordPromptScheduler {
  private bpm: number
  private frequencyInBars: number
  private lastPromptTime: number = -1
  private onPromptCallback: ((word: WordData) => void) | null = null

  constructor(bpm: number, frequencyInBars: number) {
    this.bpm = bpm
    this.frequencyInBars = frequencyInBars
  }

  /**
   * Update BPM
   */
  setBPM(bpm: number): void {
    this.bpm = bpm
  }

  /**
   * Update frequency
   */
  setFrequency(frequencyInBars: number): void {
    this.frequencyInBars = frequencyInBars
  }

  /**
   * Set callback for when a prompt should be shown
   */
  onPrompt(callback: (word: WordData) => void): void {
    this.onPromptCallback = callback
  }

  /**
   * Check if a prompt should trigger at current time
   */
  checkAndTrigger(currentTime: number, word: WordData): boolean {
    const interval = calculatePromptInterval(this.bpm, this.frequencyInBars)

    // Calculate which interval we're in
    const currentInterval = Math.floor(currentTime / interval)
    const intervalStartTime = currentInterval * interval

    // Check if we've crossed into a new interval
    const hasNewInterval = currentInterval > Math.floor(this.lastPromptTime / interval)

    if (hasNewInterval && intervalStartTime > 0) {
      this.lastPromptTime = currentTime

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
  }

  /**
   * Get interval duration
   */
  getInterval(): number {
    return calculatePromptInterval(this.bpm, this.frequencyInBars)
  }
}


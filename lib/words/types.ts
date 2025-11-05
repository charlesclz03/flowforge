export interface WordData {
  id: string
  wordText: string
  syllableCount: number
  difficultyLevel: number
  category?: string | null
}

export interface WordPromptConfig {
  difficulty: number
  frequency: number // bars
  count?: number
}

export interface WordPromptSchedule {
  word: string
  triggerTime: number // seconds into the beat
}


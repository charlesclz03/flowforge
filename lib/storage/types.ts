export interface StoredSession {
  id: string
  title: string
  beatId: string
  beatTitle: string
  beatBPM: number
  frequency: number
  difficulty: number
  durationSeconds: number
  audioData: string // base64 encoded
  createdAt: string
}

export interface UserPreferences {
  lastBeatId?: string
  lastFrequency: number
  lastDifficulty: number
  volume: number
}

export interface StorageQuota {
  used: number
  total: number
  available: number
  percentUsed: number
}

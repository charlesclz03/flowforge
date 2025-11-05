import { Beat, Word, FreestyleSession } from '@prisma/client'

// Export Prisma types
export type { Beat, Word, FreestyleSession }

// Extended types with relations
export type BeatWithSessions = Beat & {
  sessions: FreestyleSession[]
}

export type FreestyleSessionWithBeat = FreestyleSession & {
  beat: Beat
}

// API response types
export type BeatResponse = {
  id: string
  title: string
  bpm: number
  storageUrl: string
  isPremium: boolean
  genre: string | null
  duration: number | null
  artistName: string | null
}

export type WordResponse = {
  id: string
  wordText: string
  syllableCount: number
  difficultyLevel: number
  category: string | null
}

export type SessionResponse = {
  id: string
  title: string
  beatId: string
  beatTitle: string
  durationSeconds: number
  frequency: number
  difficulty: number
  createdAt: string
}

// Database operation result types
export type DatabaseResult<T> = {
  success: boolean
  data?: T
  error?: string
}

// Pagination types
export type PaginationParams = {
  page?: number
  limit?: number
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter types
export type BeatFilters = {
  isPremium?: boolean
  genre?: string
  minBpm?: number
  maxBpm?: number
}

export type WordFilters = {
  difficultyLevel?: number
  minSyllables?: number
  maxSyllables?: number
  category?: string
}

export type SessionFilters = {
  userId?: string
  beatId?: string
  difficulty?: number
  startDate?: Date
  endDate?: Date
}


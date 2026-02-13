import {
  Beat as PrismaBeat,
  Word,
  FreestyleSession,
  User,
  Prisma,
} from '@prisma/client'

// Export Prisma types
export type { Word, FreestyleSession }

// Force label inclusion to resolve tooling lag
export type Beat = PrismaBeat & {
  label?: string | null
}

// Extended types with relations
export type BeatWithSessions = Beat & {
  sessions: FreestyleSession[]
}

// Force fileSizeBytes inclusion if Prisma types lag
export type FreestyleSessionWithBeat = FreestyleSession & {
  beat: Beat
  user?: Pick<User, 'id' | 'name' | 'email' | 'image' | 'username'> | null
  fileSizeBytes?: number | null
  beatOffsetMs?: number | null // Beat position at recording start (ms)
  fxConfig?: Prisma.JsonValue | null // [STUDIO FX] Added manually
  isPublic?: boolean // [SHARE] Added manually
  audioStatus?: 'ready' | 'processing' | 'stats-only'
}

// API response types
export type BeatResponse = {
  id: string
  title: string
  bpm: number
  key?: string
  genre: string | null
  tags: string[]
  storageUrl: string
  coverImage?: string | null
  duration?: number | null
  artistName?: string | null
  label?: string | null // Added
  uploaderId?: string | null // Added
  offset: number // Added (Float in Prisma, number in TS)
  isPremium: boolean
  difficulty: 'Easy' | 'Medium' | 'Hard'
  order?: number
  createdAt: Date
  updatedAt: Date
}
export type WordResponse = {
  id: string
  wordText: string
  language: string
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
  language?: string
}

export type SessionFilters = {
  userId?: string
  beatId?: string
  difficulty?: number
  startDate?: Date
  endDate?: Date
}

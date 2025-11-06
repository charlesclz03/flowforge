import { StoredSession } from './types'
import { getAllSessions } from './sessions'

/**
 * Search sessions by title
 */
export function searchSessions(query: string): StoredSession[] {
  const sessions = getAllSessions()
  const lowerQuery = query.toLowerCase()

  return sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(lowerQuery) ||
      session.beatTitle.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Filter sessions by difficulty
 */
export function filterByDifficulty(difficulty: number): StoredSession[] {
  const sessions = getAllSessions()
  return sessions.filter((s) => s.difficulty === difficulty)
}

/**
 * Filter sessions by beat
 */
export function filterByBeat(beatId: string): StoredSession[] {
  const sessions = getAllSessions()
  return sessions.filter((s) => s.beatId === beatId)
}

/**
 * Sort sessions
 */
export function sortSessions(
  sessions: StoredSession[],
  sortBy: 'date' | 'duration' | 'title'
): StoredSession[] {
  const sorted = [...sessions]

  switch (sortBy) {
    case 'date':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    case 'duration':
      return sorted.sort((a, b) => b.durationSeconds - a.durationSeconds)
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return sorted
  }
}

/**
 * Get session statistics
 */
export function getSessionStatistics(sessions?: StoredSession[]) {
  const allSessions = sessions || getAllSessions()

  if (allSessions.length === 0) {
    return {
      totalSessions: 0,
      totalDuration: 0,
      averageDuration: 0,
      longestSession: null,
      shortestSession: null,
      favoriteGenre: null,
      sessionsByDifficulty: {},
    }
  }

  const totalDuration = allSessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  const averageDuration = totalDuration / allSessions.length

  const sorted = [...allSessions].sort((a, b) => b.durationSeconds - a.durationSeconds)
  const longestSession = sorted[0]
  const shortestSession = sorted[sorted.length - 1]

  // Count sessions by difficulty
  const sessionsByDifficulty: Record<number, number> = {}
  allSessions.forEach((s) => {
    sessionsByDifficulty[s.difficulty] = (sessionsByDifficulty[s.difficulty] || 0) + 1
  })

  return {
    totalSessions: allSessions.length,
    totalDuration,
    averageDuration: Math.round(averageDuration),
    longestSession,
    shortestSession,
    sessionsByDifficulty,
  }
}

/**
 * Export sessions as JSON
 */
export function exportSessions(): string {
  const sessions = getAllSessions()
  return JSON.stringify(sessions, null, 2)
}

/**
 * Import sessions from JSON (validate and merge)
 */
export function importSessions(jsonString: string): {
  success: boolean
  imported: number
  errors: string[]
} {
  try {
    const imported = JSON.parse(jsonString) as StoredSession[]
    const errors: string[] = []
    let _count = 0

    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected array of sessions')
    }

    // Validate each session
    imported.forEach((session, index) => {
      if (!session.id || !session.title || !session.audioData) {
        errors.push(`Session ${index + 1}: missing required fields`)
      } else {
        _count++
      }
    })

    if (errors.length > 0) {
      return {
        success: false,
        imported: 0,
        errors,
      }
    }

    // Merge with existing (keeping newer)
    const existing = getAllSessions()
    const existingIds = new Set(existing.map((s) => s.id))
    const newSessions = imported.filter((s) => !existingIds.has(s.id))

    const merged = [...newSessions, ...existing]
    localStorage.setItem('flowforge_sessions', JSON.stringify(merged))

    return {
      success: true,
      imported: newSessions.length,
      errors: [],
    }
  } catch (error) {
    return {
      success: false,
      imported: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

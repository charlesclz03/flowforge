import { StoredSession } from './types'
import { STORAGE_KEYS } from '@/lib/constants/design'
import { blobToBase64, base64ToBlob } from '@/lib/recording/utils'

/**
 * Get all stored sessions
 */
export function getAllSessions(): StoredSession[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS)
    if (!data) return []

    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading sessions from storage:', error)
    return []
  }
}

/**
 * Get a single session by ID
 */
export function getSession(id: string): StoredSession | null {
  const sessions = getAllSessions()
  return sessions.find((s) => s.id === id) || null
}

/**
 * Save a new session
 */
export async function saveSession(
  session: Omit<StoredSession, 'id' | 'createdAt' | 'audioData'>,
  audioBlob: Blob
): Promise<StoredSession> {
  try {
    // Convert blob to base64
    const audioData = await blobToBase64(audioBlob)

    const newSession: StoredSession = {
      ...session,
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      audioData,
      createdAt: new Date().toISOString(),
    }

    const sessions = getAllSessions()
    sessions.unshift(newSession) // Add to beginning

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))

    return newSession
  } catch (error) {
    console.error('Error saving session:', error)
    throw new Error('Failed to save session')
  }
}

/**
 * Update an existing session
 */
export function updateSession(
  id: string,
  updates: Partial<Omit<StoredSession, 'id' | 'createdAt' | 'audioData'>>
): StoredSession | null {
  try {
    const sessions = getAllSessions()
    const index = sessions.findIndex((s) => s.id === id)

    if (index === -1) {
      return null
    }

    const updated = {
      ...sessions[index],
      ...updates,
    }

    sessions[index] = updated
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))

    return updated
  } catch (error) {
    console.error('Error updating session:', error)
    return null
  }
}

/**
 * Delete a session
 */
export function deleteSession(id: string): boolean {
  try {
    const sessions = getAllSessions()
    const filtered = sessions.filter((s) => s.id !== id)

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered))

    return true
  } catch (error) {
    console.error('Error deleting session:', error)
    return false
  }
}

/**
 * Delete all sessions
 */
export function deleteAllSessions(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS)
    return true
  } catch (error) {
    console.error('Error deleting all sessions:', error)
    return false
  }
}

/**
 * Get audio blob from session
 */
export function getSessionAudioBlob(session: StoredSession): Blob {
  return base64ToBlob(session.audioData)
}

/**
 * Get storage usage stats
 */
export function getStorageStats(): {
  sessionCount: number
  totalSize: number
  oldestSession: Date | null
  newestSession: Date | null
} {
  const sessions = getAllSessions()

  if (sessions.length === 0) {
    return {
      sessionCount: 0,
      totalSize: 0,
      oldestSession: null,
      newestSession: null,
    }
  }

  // Estimate size (rough calculation)
  const totalSize = JSON.stringify(sessions).length

  // Get dates
  const dates = sessions.map((s) => new Date(s.createdAt))
  const oldest = new Date(Math.min(...dates.map((d) => d.getTime())))
  const newest = new Date(Math.max(...dates.map((d) => d.getTime())))

  return {
    sessionCount: sessions.length,
    totalSize,
    oldestSession: oldest,
    newestSession: newest,
  }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Clean up old sessions if storage is full
 */
export function cleanupOldSessions(keepCount: number = 10): number {
  try {
    const sessions = getAllSessions()

    if (sessions.length <= keepCount) {
      return 0
    }

    // Sort by date (newest first)
    const sorted = sessions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Keep only the newest ones
    const toKeep = sorted.slice(0, keepCount)
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(toKeep))

    return sessions.length - keepCount
  } catch (error) {
    console.error('Error cleaning up sessions:', error)
    return 0
  }
}

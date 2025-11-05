'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getAllSessions,
  getSession,
  saveSession,
  updateSession,
  deleteSession,
  deleteAllSessions,
  getSessionAudioBlob,
  getStorageStats,
} from '@/lib/storage/sessions'
import { StoredSession } from '@/lib/storage/types'

export function useSessionStorage() {
  const [sessions, setSessions] = useState<StoredSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load sessions on mount
  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = useCallback(() => {
    setIsLoading(true)
    const loaded = getAllSessions()
    setSessions(loaded)
    setIsLoading(false)
  }, [])

  const save = useCallback(
    async (
      session: Omit<StoredSession, 'id' | 'createdAt' | 'audioData'>,
      audioBlob: Blob
    ) => {
      try {
        const saved = await saveSession(session, audioBlob)
        setSessions((prev) => [saved, ...prev])
        return saved
      } catch (error) {
        console.error('Error saving session:', error)
        throw error
      }
    },
    []
  )

  const update = useCallback(
    (id: string, updates: Partial<Omit<StoredSession, 'id' | 'createdAt' | 'audioData'>>) => {
      const updated = updateSession(id, updates)
      if (updated) {
        setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)))
      }
      return updated
    },
    []
  )

  const remove = useCallback((id: string) => {
    const success = deleteSession(id)
    if (success) {
      setSessions((prev) => prev.filter((s) => s.id !== id))
    }
    return success
  }, [])

  const removeAll = useCallback(() => {
    const success = deleteAllSessions()
    if (success) {
      setSessions([])
    }
    return success
  }, [])

  const getAudioBlob = useCallback((session: StoredSession) => {
    return getSessionAudioBlob(session)
  }, [])

  const stats = useCallback(() => {
    return getStorageStats()
  }, [])

  return {
    sessions,
    isLoading,
    save,
    update,
    remove,
    removeAll,
    getAudioBlob,
    stats,
    reload: loadSessions,
  }
}


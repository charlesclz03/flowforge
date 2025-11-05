'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { Beat } from '@/types/database'

interface SessionState {
  selectedBeat: Beat | null
  frequency: number
  difficulty: number
  isActive: boolean
}

interface SessionContextValue extends SessionState {
  setBeat: (beat: Beat | null) => void
  setFrequency: (freq: number) => void
  setDifficulty: (diff: number) => void
  startSession: () => void
  stopSession: () => void
  resetSession: () => void
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    selectedBeat: null,
    frequency: 8,
    difficulty: 2,
    isActive: false,
  })

  const setBeat = useCallback((beat: Beat | null) => {
    setState((prev) => ({ ...prev, selectedBeat: beat }))
  }, [])

  const setFrequency = useCallback((freq: number) => {
    setState((prev) => ({ ...prev, frequency: freq }))
  }, [])

  const setDifficulty = useCallback((diff: number) => {
    setState((prev) => ({ ...prev, difficulty: diff }))
  }, [])

  const startSession = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: true }))
  }, [])

  const stopSession = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: false }))
  }, [])

  const resetSession = useCallback(() => {
    setState({
      selectedBeat: null,
      frequency: 8,
      difficulty: 2,
      isActive: false,
    })
  }, [])

  return (
    <SessionContext.Provider
      value={{
        ...state,
        setBeat,
        setFrequency,
        setDifficulty,
        startSession,
        stopSession,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}


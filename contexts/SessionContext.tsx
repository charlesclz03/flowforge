'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { Beat } from '@/types/database'

export interface PracticeSessionState {
  selectedBeat: Beat | null
  frequency: number
  difficulty: number
  isActive: boolean
}

interface PracticeSessionContextValue extends PracticeSessionState {
  setBeat: (beat: Beat | null) => void
  setFrequency: (freq: number) => void
  setDifficulty: (diff: number) => void
  startSession: () => void
  stopSession: () => void
  resetSession: () => void
}

const PracticeSessionContext = createContext<PracticeSessionContextValue | undefined>(undefined)

export function PracticeSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PracticeSessionState>({
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
    <PracticeSessionContext.Provider
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
    </PracticeSessionContext.Provider>
  )
}

export function usePracticeSession() {
  const context = useContext(PracticeSessionContext)
  if (!context) {
    throw new Error('usePracticeSession must be used within a PracticeSessionProvider')
  }
  return context
}


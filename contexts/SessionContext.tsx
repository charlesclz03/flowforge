'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import { Beat } from '@/types/database'

export interface PracticeSessionState {
  selectedBeat: Beat | null
  frequency: number
  difficulty: number
  isActive: boolean
  isTTSEnabled: boolean
  ttsVolume: number // 0.0 to 1.0
  isLoaded: boolean
  mode: 'solo' | 'cypher'
  wordCategory: string | null
  cypherPlayers: number
}

interface PracticeSessionContextValue extends PracticeSessionState {
  setBeat: (beat: Beat | null) => void
  setFrequency: (freq: number) => void
  setDifficulty: (diff: number) => void
  setTTSEnabled: (enabled: boolean) => void
  setTTSVolume: (volume: number) => void
  setMode: (mode: 'solo' | 'cypher') => void
  setCypherPlayers: (count: number) => void
  setWordCategory: (category: string | null) => void
  testVoice: () => void
  startSession: () => void
  stopSession: () => void
  resetSession: () => void
}

const PracticeSessionContext = createContext<
  PracticeSessionContextValue | undefined
>(undefined)

export function PracticeSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PracticeSessionState>({
    selectedBeat: null,
    frequency: 4,
    difficulty: 2,
    isActive: false,
    isTTSEnabled: true,
    ttsVolume: 0.5,
    isLoaded: false,
    mode: 'solo',
    cypherPlayers: 2,
    wordCategory: null,
  })

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('flowforge_session_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Ensure we don't restore invalid state like stuck active
        setState((prev) => ({
          ...prev,
          ...parsed,
          isActive: false,
        }))
      }
    } catch (e) {
      console.error('Failed to load session state', e)
    } finally {
      setState((prev) => ({ ...prev, isLoaded: true }))
    }
  }, [])

  // Save state to localStorage on changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!state.isLoaded) return

    const {
      selectedBeat,
      frequency,
      difficulty,
      isTTSEnabled,
      ttsVolume,
      mode,
      cypherPlayers,
      wordCategory,
    } = state
    const toSave = {
      selectedBeat,
      frequency,
      difficulty,
      isTTSEnabled,
      ttsVolume,
      mode,
      cypherPlayers,
      wordCategory,
    }
    localStorage.setItem('flowforge_session_state', JSON.stringify(toSave))
  }, [state])

  const setBeat = useCallback((beat: Beat | null) => {
    setState((prev) => ({ ...prev, selectedBeat: beat }))
  }, [])

  const setFrequency = useCallback((freq: number) => {
    setState((prev) => ({ ...prev, frequency: freq }))
  }, [])

  const setDifficulty = useCallback((diff: number) => {
    setState((prev) => ({ ...prev, difficulty: diff }))
  }, [])

  const setTTSEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, isTTSEnabled: enabled }))
  }, [])

  const setTTSVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, ttsVolume: volume }))
  }, [])

  const setMode = useCallback((mode: 'solo' | 'cypher') => {
    setState((prev) => ({ ...prev, mode }))
  }, [])

  const setCypherPlayers = useCallback((count: number) => {
    setState((prev) => ({ ...prev, cypherPlayers: count }))
  }, [])

  const setWordCategory = useCallback((category: string | null) => {
    setState((prev) => ({ ...prev, wordCategory: category }))
  }, [])

  const startSession = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: true }))
  }, [])

  const stopSession = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: false }))
  }, [])

  const resetSession = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedBeat: null,
      frequency: 4,
      difficulty: 2,
      isActive: false,
      mode: 'solo',
      cypherPlayers: 2,
      wordCategory: null,
    }))
  }, [])

  return (
    <PracticeSessionContext.Provider
      value={{
        ...state,
        setBeat,
        setFrequency,
        setDifficulty,
        setTTSEnabled,
        setTTSVolume,
        setMode,
        setCypherPlayers,
        setWordCategory,
        testVoice: useCallback(() => {
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            const u = new SpeechSynthesisUtterance(
              'Mic check, one two. FlowForge audio systems operational.'
            )
            u.rate = 1.1
            u.volume = state.ttsVolume
            window.speechSynthesis.speak(u)
          }
        }, [state.ttsVolume]),
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
    throw new Error(
      'usePracticeSession must be used within a PracticeSessionProvider'
    )
  }
  return context
}

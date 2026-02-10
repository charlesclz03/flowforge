'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
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
  cypherPlayers: number
  isRecordingEnabled: boolean
  isStudioFXEnabled: boolean
  beatVolume: number
  // Navigation Guard State
  showExitPrompt: boolean
  pendingNavigation: string | (() => void) | null
}

interface PracticeSessionContextValue extends PracticeSessionState {
  setBeat: (beat: Beat | null) => void
  setFrequency: (freq: number) => void
  setDifficulty: (diff: number) => void
  setTTSEnabled: (enabled: boolean) => void
  setTTSVolume: (volume: number) => void
  setMode: (mode: 'solo' | 'cypher') => void
  setCypherPlayers: (count: number) => void
  setIsRecordingEnabled: (enabled: boolean) => void
  setStudioFXEnabled: (enabled: boolean) => void
  setBeatVolume: (volume: number) => void
  testVoice: () => void
  startSession: () => void
  stopSession: () => void
  resetSession: () => void
  // Navigation Guard Actions
  attemptNavigation: (target: string | (() => void)) => void
  confirmNavigation: () => void
  cancelNavigation: () => void
}

const PracticeSessionContext = createContext<
  PracticeSessionContextValue | undefined
>(undefined)

export function PracticeSessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
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
    isRecordingEnabled: false,
    isStudioFXEnabled: true,
    beatVolume: 0.7,
    showExitPrompt: false,
    pendingNavigation: null,
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
      isRecordingEnabled,
      isStudioFXEnabled,
      beatVolume,
    } = state
    const toSave = {
      selectedBeat,
      frequency,
      difficulty,
      isTTSEnabled,
      ttsVolume,
      mode,
      cypherPlayers,
      isRecordingEnabled,
      isStudioFXEnabled,
      beatVolume,
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

  const setIsRecordingEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, isRecordingEnabled: enabled }))
  }, [])

  const setStudioFXEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, isStudioFXEnabled: enabled }))
  }, [])

  const setBeatVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, beatVolume: volume }))
  }, [])

  const startSession = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: true }))
  }, [])

  const stopSession = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      showExitPrompt: false,
      pendingNavigation: null,
    }))
  }, [])

  // Guard self-heal: a session should never remain "active" (or keep a prompt open)
  // once we are off the /practice route.
  useEffect(() => {
    const isPracticeRoute =
      pathname === '/practice' || pathname.startsWith('/practice/')

    if (isPracticeRoute) return

    setState((prev) => {
      if (!prev.isActive && !prev.showExitPrompt && !prev.pendingNavigation) {
        return prev
      }

      return {
        ...prev,
        isActive: false,
        showExitPrompt: false,
        pendingNavigation: null,
      }
    })
  }, [pathname])

  const resetSession = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedBeat: null,
      frequency: 4,
      difficulty: 2,
      isActive: false,
      mode: 'solo',
      cypherPlayers: 2,
    }))
  }, [])

  // Navigation Guard Logic
  const attemptNavigation = useCallback(
    (target: string | (() => void)) => {
      const isPracticeRoute =
        pathname === '/practice' || pathname.startsWith('/practice/')

      // Only enforce the exit guard while inside the active practice route.
      if (state.isActive && isPracticeRoute) {
        setState((prev) => ({
          ...prev,
          showExitPrompt: true,
          pendingNavigation: target, // Store the target for later
        }))
      } else {
        // Self-heal stale session flags when leaving /practice without proper teardown.
        if (state.isActive && !isPracticeRoute) {
          setState((prev) => ({
            ...prev,
            isActive: false,
            showExitPrompt: false,
            pendingNavigation: null,
          }))
        }

        // If not active, just go immediately
        if (typeof target === 'string') {
          router.push(target)
        } else if (typeof target === 'function') {
          target()
        }
      }
    },
    [state.isActive, pathname, router]
  )

  const cancelNavigation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showExitPrompt: false,
      pendingNavigation: null,
    }))
  }, [])

  const confirmNavigation = useCallback(() => {
    // 1. Stop audio / session (optimistic local state update)
    // We rely on effects or consumers to handle the "Real" drop logic if needed,
    // but primarily we just want to kill the active flag so we can leave.

    // Explicitly cancel TTS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    setState((prev) => ({ ...prev, isActive: false, showExitPrompt: false }))

    // 2. Perform pending action
    const target = state.pendingNavigation
    if (target) {
      if (typeof target === 'string') {
        router.push(target)
      } else if (typeof target === 'function') {
        target()
      }
    }

    // Reset pending
    setState((prev) => ({ ...prev, pendingNavigation: null }))
  }, [state.pendingNavigation, router])

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
        setIsRecordingEnabled,
        setStudioFXEnabled,
        setBeatVolume,
        testVoice: useCallback(() => {
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            const u = new SpeechSynthesisUtterance(
              'Mic check, one two. FreeStyla audio systems operational.'
            )
            u.rate = 1.1
            u.volume = state.ttsVolume
            window.speechSynthesis.speak(u)
          }
        }, [state.ttsVolume]),
        startSession,
        stopSession,
        resetSession,
        attemptNavigation,
        confirmNavigation,
        cancelNavigation,
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

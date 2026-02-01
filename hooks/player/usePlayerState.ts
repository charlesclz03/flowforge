import { useReducer } from 'react'

export type PlayerStatus =
  | 'IDLE' // Waiting to start
  | 'COUNTDOWN' // 3-2-1-GO
  | 'PLAYING' // Session active
  | 'PAUSED' // Session paused
  | 'FINISHING' // Calculating duration / processing
  | 'MIXING' // [NEW] Client-side mixing (Voice + Beat)
  | 'SAVING' // Async save in progress
  | 'COMPLETED' // Session done, summary shown
  | 'EXITING' // Redirecting

export interface PlayerState {
  status: PlayerStatus
  error: string | null
  // Metadata for the current session run
  startTime: number | null
  totalPausedTime: number
  lastPauseTime: number | null
  // Meta flags
  isGuest: boolean
  shouldSave: boolean
}

export type PlayerAction =
  | { type: 'START' }
  | { type: 'COUNTDOWN_COMPLETE' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP'; shouldSave?: boolean }
  | { type: 'START_MIXING' } // [NEW]
  | { type: 'START_SAVE' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; error: string }
  | { type: 'DISCARD' }
  | { type: 'EXIT' }
  | { type: 'RESET' }
  | { type: 'SET_GUEST_MODE'; isGuest: boolean }

const initialState: PlayerState = {
  status: 'IDLE',
  error: null,
  startTime: null,
  totalPausedTime: 0,
  lastPauseTime: null,
  isGuest: false,
  shouldSave: true,
}

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_GUEST_MODE':
      return { ...state, isGuest: action.isGuest }

    case 'START':
      if (state.status !== 'IDLE' && state.status !== 'COMPLETED') {
        console.warn('Invalid transition: START from', state.status)
        return state
      }
      return {
        ...initialState, // Reset all flags
        isGuest: state.isGuest, // Preserve guest mode
        status: 'COUNTDOWN',
      }

    case 'COUNTDOWN_COMPLETE':
      if (state.status !== 'COUNTDOWN') return state
      return {
        ...state,
        status: 'PLAYING',
        startTime: Date.now(),
      }

    case 'PAUSE':
      if (state.status !== 'PLAYING') return state
      return {
        ...state,
        status: 'PAUSED',
        lastPauseTime: Date.now(),
      }

    case 'RESUME':
      if (state.status !== 'PAUSED') return state
      const pauseDuration = state.lastPauseTime
        ? Date.now() - state.lastPauseTime
        : 0
      return {
        ...state,
        status: 'PLAYING',
        lastPauseTime: null,
        totalPausedTime: state.totalPausedTime + pauseDuration,
      }

    case 'STOP':
      // Can stop from mostly anywhere active
      if (
        state.status === 'IDLE' ||
        state.status === 'COMPLETED' ||
        state.status === 'EXITING'
      )
        return state

      return {
        ...state,
        status: 'FINISHING',
        shouldSave: action.shouldSave ?? true,
      }

    case 'DISCARD':
      return {
        ...state,
        status: 'EXITING',
        shouldSave: false,
      }

    case 'START_MIXING':
      if (state.status !== 'FINISHING') return state
      return {
        ...state,
        status: 'MIXING',
      }

    case 'START_SAVE':
      // Can start save from FINISHING (old way) or MIXING (new way)
      if (state.status !== 'FINISHING' && state.status !== 'MIXING') return state
      return {
        ...state,
        status: 'SAVING',
      }

    case 'SAVE_SUCCESS':
      return {
        ...state,
        status: 'COMPLETED',
      }

    case 'SAVE_ERROR':
      return {
        ...state,
        status: 'COMPLETED', // We go to completed even on error to show summary/error toast? Or stay in finishing?
        // Actually, usually we show a toast and let them stay or exit.
        // For now, let's treat error as a completion state but with error field.
        error: action.error,
      }

    case 'EXIT':
      return {
        ...state,
        status: 'EXITING',
      }

    case 'RESET':
      return {
        ...initialState,
        isGuest: state.isGuest,
      }

    default:
      return state
  }
}

export function usePlayerState() {
  const [state, dispatch] = useReducer(playerReducer, initialState)
  return { state, dispatch }
}

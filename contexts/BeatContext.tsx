'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useBeatPlayer } from '@/hooks/useBeatPlayer'
import { BeatMetadata } from '@/lib/beats/types'

interface BeatContextValue {
  isPlaying: boolean
  currentTime: number
  duration: number
  isLoading: boolean
  error: string | null
  currentBeat: BeatMetadata | null
  loadBeat: (beat: BeatMetadata) => Promise<void>
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  toggle: () => Promise<void>
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setLoop: (loop: boolean) => void
}

const BeatContext = createContext<BeatContextValue | undefined>(undefined)

export function BeatProvider({ children }: { children: ReactNode }) {
  const beatPlayer = useBeatPlayer()

  return (
    <BeatContext.Provider value={beatPlayer}>
      {children}
    </BeatContext.Provider>
  )
}

export function useBeat() {
  const context = useContext(BeatContext)
  if (context === undefined) {
    throw new Error('useBeat must be used within a BeatProvider')
  }
  return context
}


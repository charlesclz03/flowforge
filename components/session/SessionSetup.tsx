'use client'

import { Beat } from '@/types/database'
import { BeatSelector } from '../beats/BeatSelector'
import { FrequencySelector } from './FrequencySelector'
import { DifficultySelector } from './DifficultySelector'
import { cn } from '@/lib/utils'

interface SessionSetupProps {
  beats: Beat[]
  selectedBeat: Beat | null
  onSelectBeat: (beat: Beat) => void
  frequency: number
  onFrequencyChange: (value: number) => void
  difficulty: number
  onDifficultyChange: (value: number) => void
  onStart: () => void
  className?: string
}

export function SessionSetup({
  beats,
  selectedBeat,
  onSelectBeat,
  frequency,
  onFrequencyChange,
  difficulty,
  onDifficultyChange,
  onStart,
  className,
}: SessionSetupProps) {
  const canStart = selectedBeat !== null

  return (
    <div className={cn('space-y-6', className)}>
      {/* Beat Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium">Select a Beat</h2>
        <BeatSelector beats={beats} selectedBeat={selectedBeat} onSelect={onSelectBeat} />
      </div>

      {/* Settings */}
      {selectedBeat && (
        <div className="space-y-4">
          <FrequencySelector value={frequency} onChange={onFrequencyChange} />
          <DifficultySelector value={difficulty} onChange={onDifficultyChange} />
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={onStart}
        disabled={!canStart}
        className={cn(
          'w-full py-4 rounded-xl font-medium text-lg transition-all',
          'bg-accent-orange text-black',
          'hover:bg-opacity-90 active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          'shadow-lg shadow-accent-orange/20'
        )}
      >
        Start Practice Session
      </button>
    </div>
  )
}

'use client'

import { Card } from '@/components/atoms/Card'
import { PlayButton } from '@/components/molecules/practice/PlayButton'
import { WordPrompt } from '@/components/molecules/practice/WordPrompt'
import { RecordingIndicator } from '@/components/molecules/practice/RecordingIndicator'
import { Beat } from '@/types/database'
import { cn } from '@/lib/utils'
import { getIntervalProgress } from '@/lib/beats/utils'

interface PracticeControlsProps {
  selectedBeat: Beat
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  sessionDuration: number
  currentWord: string
  isRecording: boolean
  recordingDuration: number
  error?: string | null
  onToggle: () => void
  playButtonSize: number
  difficulty: number
  frequency: number
  isGolden?: boolean
  onSkipWord?: () => void
}

export function PracticeControls({
  selectedBeat,
  isPlaying,
  isLoading,
  currentTime,
  sessionDuration,
  currentWord,
  isRecording,
  recordingDuration,
  error,
  onToggle,
  playButtonSize,
  difficulty,
  frequency,
  isGolden = false,
  onSkipWord,
}: PracticeControlsProps) {
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) {
      return '2:00'
    }
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const micPermissionError =
    error?.toLowerCase().includes('notallowederror') ||
    error?.toLowerCase().includes('permission denied') ||
    error?.toLowerCase().includes('failed to access microphone')

  // const shouldShowError = Boolean(error && !micPermissionError) && !isPlaying && !isLoading

  const getDifficultyMeta = () => {
    if (difficulty <= 1) {
      return {
        label: 'Easy',
        classes: 'bg-accent-green/20 text-accent-green',
      }
    }
    if (difficulty === 2) {
      return {
        label: 'Medium',
        classes: 'bg-accent-purple/20 text-accent-purple',
      }
    }
    return {
      label: 'Hard',
      classes: 'bg-accent-red/20 text-accent-red',
    }
  }

  const difficultyMeta = getDifficultyMeta()
  // const frequencyMeta = getFrequencyMeta()

  // Calculate timer ring progress (Countdown to next word)
  // We want the ring to fill up as we approach the next word change
  const intervalProgress = getIntervalProgress(currentTime || 0, selectedBeat.bpm, frequency)

  return (
    <Card padding="lg">
      <div className="flex flex-col items-center gap-6 sm:gap-8">
        {/* Session Info */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5/60 px-5 py-2.5 text-sm sm:text-base text-text-primary backdrop-blur-heavy shadow-soft">
            <span className="font-medium truncate max-w-[100px] sm:max-w-none">
              {selectedBeat.title}
            </span>
            <span className="text-accent-purple text-lg">•</span>
            <span className="text-text-secondary truncate max-w-[90px] sm:max-w-none">
              {selectedBeat.artistName || 'Producer'}
            </span>
            <span className="text-accent-purple text-lg">•</span>
            <span className="text-text-secondary">{selectedBeat.bpm} BPM</span>
          </div>
          <div className="text-4xl sm:text-5xl font-light text-white">
            {formatTime(Math.max(0, sessionDuration - (currentTime || 0)))}
          </div>
          <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-wider text-text-tertiary">
            {/* Difficulty pill (left of mic) */}
            <div
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-medium',
                difficultyMeta.classes
              )}
            >
              <span>{difficultyMeta.label}</span>
            </div>

            {/* Recording indicator (center) */}
            <RecordingIndicator
              isRecording={(isRecording || isPlaying) && !micPermissionError}
              duration={recordingDuration}
              maxDuration={sessionDuration}
              showDuration={false}
            />
          </div>
        </div>

        {/* Word Prompt */}
        <div className="flex w-full items-center justify-center">
          <WordPrompt
            word={currentWord || null}
            show={isPlaying && !!currentWord}
            isGolden={isGolden}
          />
        </div>

        {/* Play Button with Timer Ring - Responsive size */}
        <div className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] flex items-center justify-center relative">
          <PlayButton
            isPlaying={isPlaying}
            progress={intervalProgress}
            onToggle={onToggle}
            disabled={!selectedBeat || isLoading}
            size={playButtonSize}
          />

          {/* Panic Button */}
          {isPlaying && onSkipWord && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSkipWord()
              }}
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 group"
              title="Skip Word (-500 pts)"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                <span className="text-xl">⚠️</span>
              </div>
              <span className="text-[10px] text-red-500/70 font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Panic
              </span>
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

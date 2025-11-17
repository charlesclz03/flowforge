'use client'

import { Card } from '@/components/atoms/Card'
import { PlayButton } from '@/components/molecules/practice/PlayButton'
import { WordPrompt } from '@/components/molecules/practice/WordPrompt'
import { RecordingIndicator } from '@/components/molecules/practice/RecordingIndicator'
import { Beat } from '@/types/database'
import { cn } from '@/lib/utils'

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

  const shouldShowError = Boolean(error && !micPermissionError) && !isPlaying && !isLoading

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

  const getFrequencyMeta = () => {
    if (frequency === 4) {
      return {
        label: '4 bars',
      }
    }
    if (frequency === 8) {
      return {
        label: '8 bars',
      }
    }
    return {
      label: '16 bars',
    }
  }

  const difficultyMeta = getDifficultyMeta()
  const frequencyMeta = getFrequencyMeta()

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
            <RecordingIndicator
              isRecording={(isRecording || isPlaying) && !micPermissionError}
              duration={recordingDuration}
              maxDuration={sessionDuration}
              showDuration={false}
            />
          </div>
        </div>

        {/* Error Message - only show when not currently playing or loading */}
        {shouldShowError && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Word Prompt with difficulty / frequency context */}
        <div className="flex w-full items-center justify-between gap-4">
          {/* Difficulty display (left) */}
          <div className="max-w-[180px] flex-1 space-y-1 text-left">
            <div
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                difficultyMeta.classes
              )}
            >
              <span>{difficultyMeta.label}</span>
            </div>
          </div>

          {/* Word prompt (center) */}
          <div className="flex flex-[2] items-center justify-center">
            <WordPrompt word={currentWord || null} show={isPlaying && !!currentWord} />
          </div>

          {/* Frequency display (right) */}
          <div className="max-w-[180px] flex-1 space-y-1 text-right">
            <div className="inline-flex items-center justify-end">
              <span className="rounded-full bg-accent-purple/20 px-3 py-1 text-xs font-medium text-accent-purple whitespace-nowrap">
                {frequencyMeta.label}
              </span>
            </div>
          </div>
        </div>

        {/* Play Button with Timer Ring - Responsive size */}
        <div className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] flex items-center justify-center">
          <PlayButton
            isPlaying={isPlaying}
            progress={currentTime / sessionDuration}
            onToggle={onToggle}
            disabled={!selectedBeat || isLoading}
            size={playButtonSize}
          />
        </div>

      </div>
    </Card>
  )
}

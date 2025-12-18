'use client'

import { Card } from '@/components/atoms/Card'
import { Play as PlayButtonIcon, RefreshCcw, Zap, Gauge } from 'lucide-react'
import { motion } from 'framer-motion'
import { TimerRing } from '@/components/atoms/TimerRing'
import { WordPrompt } from '@/components/molecules/practice/WordPrompt'
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
  onToggle: () => void
  onRestart?: () => void
  difficulty: number
  frequency: number
  isGolden?: boolean
  isRecording?: boolean
  recordingDuration?: number
  error?: string | null
  onDifficultyChange?: (value: number) => void
  onFrequencyChange?: (value: number) => void
  cleanUI?: boolean
}

export function PracticeControls({
  selectedBeat,
  isPlaying,
  isLoading,
  currentTime,
  sessionDuration,
  currentWord,
  onToggle,
  onRestart,
  difficulty,
  frequency,
  isGolden = false,
  isRecording = false,
  recordingDuration = 0,
  error,
  onDifficultyChange,
  onFrequencyChange,
  cleanUI = false,
}: PracticeControlsProps) {
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) {
      return '2:00'
    }
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyMeta = () => {
    if (difficulty <= 1) {
      return {
        label: 'Easy',
        classes:
          'bg-accent-green/20 text-accent-green border-accent-green/30 hover:bg-accent-green/30',
      }
    }
    if (difficulty === 2) {
      return {
        label: 'Medium',
        classes:
          'bg-accent-purple/20 text-accent-purple border-accent-purple/30 hover:bg-accent-purple/30',
      }
    }
    return {
      label: 'Hard',
      classes: 'bg-accent-red/20 text-accent-red border-accent-red/30 hover:bg-accent-red/30',
    }
  }

  const difficultyMeta = getDifficultyMeta()
  const intervalProgress = getIntervalProgress(currentTime || 0, selectedBeat.bpm, frequency)

  // Handlers for cycling settings
  const cycleDifficulty = () => {
    if (!onDifficultyChange) return
    const nextDiff = difficulty >= 3 ? 1 : difficulty + 1
    onDifficultyChange(nextDiff)
  }

  const cycleFrequency = () => {
    if (!onFrequencyChange) return
    // Cycle between 2, 4, 8 bars
    const nextFreq = frequency === 2 ? 4 : frequency === 4 ? 8 : 2
    onFrequencyChange(nextFreq)
  }

  return (
    <Card
      padding="lg"
      className={cn(
        'transition-opacity duration-500',
        cleanUI ? 'bg-black/20 backdrop-blur-sm border-white/5' : ''
      )}
    >
      <div className="flex flex-col items-center gap-4 sm:gap-6">
        {/* Session Info (Text Only) - Hidden in Clean UI if desired, or kept minimal */}
        <div
          className={cn(
            'text-center space-y-2 transition-all duration-300',
            cleanUI ? 'opacity-50 hover:opacity-100' : ''
          )}
        >
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5/60 px-5 py-2.5 text-sm sm:text-base text-text-primary backdrop-blur-heavy shadow-soft">
            <span className="font-medium truncate max-w-[100px] sm:max-w-none">
              {selectedBeat.title}
            </span>
            <span className="text-accent-purple text-lg">•</span>
            <span className="text-text-secondary truncate max-w-[90px] sm:max-w-none">
              {selectedBeat.artistName || 'Producer'}
            </span>
          </div>

          {/* Live Controls: Difficulty & Frequency */}
          <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-wider text-text-tertiary">
            {/* Difficulty Pill */}
            <button
              onClick={cycleDifficulty}
              disabled={!onDifficultyChange}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-medium border transition-all',
                difficultyMeta.classes,
                !onDifficultyChange && 'cursor-default opacity-80'
              )}
              title="Click to change difficulty"
            >
              <Gauge size={10} />
              <span>{difficultyMeta.label}</span>
            </button>

            {/* BPM Display */}
            <span className="opacity-50">{selectedBeat.bpm} BPM</span>

            {/* Frequency Pill */}
            <button
              onClick={cycleFrequency}
              disabled={!onFrequencyChange}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-colors',
                !onFrequencyChange && 'cursor-default opacity-50'
              )}
              title="Click to change word frequency"
            >
              <Zap
                size={10}
                className={
                  frequency === 2
                    ? 'text-accent-red'
                    : frequency === 4
                      ? 'text-accent-yellow'
                      : 'text-accent-blue'
                }
              />
              <span>{frequency} Bars</span>
            </button>
          </div>
        </div>

        {/* Word Prompt */}
        <div id="tour-word-prompt" className="flex w-full items-center justify-center h-16">
          <WordPrompt
            word={currentWord || null}
            show={isPlaying && !!currentWord}
            isGolden={isGolden}
          />
        </div>

        {/* Action Buttons */}
        <div
          className={cn(
            'flex items-center gap-3 transition-opacity duration-300',
            cleanUI && !isPlaying
              ? 'opacity-100'
              : cleanUI
                ? 'opacity-0 hover:opacity-100'
                : 'opacity-100'
          )}
        >
          {onRestart && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRestart}
              className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
              aria-label="Restart Session"
            >
              <RefreshCcw size={14} />
              <span>Restart</span>
            </motion.button>
          )}
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        {/* Hero Player (Landing Page Style) */}
        <div className="relative">
          <motion.button
            id="tour-record-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={
              isPlaying
                ? isRecording
                  ? { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 1.5 } } // Heartbeat
                  : { scale: 1 }
                : { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 3 } } // Idle Breath
            }
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(10)
              }
              onToggle()
            }}
            disabled={isLoading}
            className={cn(
              'relative flex items-center justify-center rounded-full transition-colors duration-300 group outline-none',
              'w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px]', // Responsive sizing
              'border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl',
              isPlaying
                ? 'border-accent-purple/30 shadow-purple-glow'
                : 'hover:bg-white/5 hover:border-white/20'
            )}
          >
            {/* Ambient Glows */}
            <div
              className={cn(
                'absolute inset-0 rounded-full opacity-0 transition-opacity duration-700',
                isPlaying && 'opacity-100'
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/20 to-transparent blur-3xl" />
              <div className="absolute inset-4 animate-spin-slow rounded-full border border-transparent border-t-accent-purple/30 border-r-accent-purple/10" />
            </div>

            {/* Timer Ring */}
            <div className="absolute inset-0 p-8">
              <TimerRing
                progress={intervalProgress}
                size={320}
                className={cn(
                  'w-full h-full text-white/10 transition-colors duration-500',
                  isPlaying && 'text-accent-purple drop-shadow-neon'
                )}
                strokeWidth={4}
              />
            </div>

            {/* Inner Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-1">
              {isPlaying ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    {isRecording && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-[0.2em]',
                        isRecording ? 'text-red-400' : 'text-accent-purple'
                      )}
                    >
                      {isRecording ? 'Recording' : 'Playing'}
                    </span>
                  </div>

                  <span className="text-5xl sm:text-6xl font-light text-white tabular-nums tracking-tighter">
                    {/* Show elapsed recording time if recording, otherwise countdown */}
                    {isRecording
                      ? formatTime(recordingDuration)
                      : formatTime(Math.max(0, sessionDuration - (currentTime || 0)))}
                  </span>

                  <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider mt-1">
                    Tap to Stop
                  </span>
                </>
              ) : isLoading ? (
                <>
                  <div className="h-16 w-16 mb-2 rounded-full border-2 border-accent-purple/30 border-t-accent-purple animate-spin" />
                  <span className="text-sm font-medium text-text-tertiary uppercase tracking-widest">
                    Loading Audio
                  </span>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 mb-2 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <PlayButtonIcon className="ml-1 w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-text-secondary uppercase tracking-widest">
                    Start Session
                  </span>
                </>
              )}
            </div>
          </motion.button>
        </div>
      </div>
    </Card>
  )
}

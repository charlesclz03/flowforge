'use client'

import { Card } from '@/components/atoms/Card'
import { Play as PlayButtonIcon, RefreshCcw } from 'lucide-react'
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
  // eslint-disable-next-line
  onToggle: () => void
  onRestart?: () => void
  difficulty: number
  frequency: number
  isGolden?: boolean
  onSkipWord?: () => void
  isRecording?: boolean
  recordingDuration?: number
  error?: string | null
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
  onSkipWord,
  isRecording = false,
  recordingDuration = 0,
  error,
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
        {/* Session Info (Text Only) */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5/60 px-5 py-2.5 text-sm sm:text-base text-text-primary backdrop-blur-heavy shadow-soft">
            <span className="font-medium truncate max-w-[100px] sm:max-w-none">
              {selectedBeat.title}
            </span>
            <span className="text-accent-purple text-lg">•</span>
            <span className="text-text-secondary truncate max-w-[90px] sm:max-w-none">
              {selectedBeat.artistName || 'Producer'}
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-wider text-text-tertiary">
            <div
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-medium',
                difficultyMeta.classes
              )}
            >
              <span>{difficultyMeta.label}</span>
            </div>
            {selectedBeat.bpm} BPM
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
        <div className="flex items-center gap-3">
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

          {onSkipWord && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSkipWord}
              className="px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <span>😱 Panic!</span>
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
              'w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]', // Large size
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

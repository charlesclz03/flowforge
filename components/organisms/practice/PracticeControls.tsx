import { useState } from 'react'
import { Card } from '@/components/atoms/Card'
import { RefreshCcw, Zap, Gauge, Infinity as InfinityIcon, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { TimerRing } from '@/components/atoms/TimerRing'
import { WordPrompt } from '@/components/molecules/practice/WordPrompt'
import { Beat } from '@/types/database'
import { cn } from '@/lib/utils'
import { getIntervalProgress } from '@/lib/beats/utils'
import { PWAInstallModal } from '@/components/molecules/pwa/PWAInstallModal'

type PracticeControlsProps = {
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
  isInfiniteMode?: boolean
  recordingDuration?: number
  error?: string | null
  onDifficultyChange?: (value: number) => void
  onFrequencyChange?: (value: number) => void
  isPro?: boolean
  isAuthenticated?: boolean
  onUpgrade?: () => void
  mode?: 'solo' | 'cypher'
}

export default function PracticeControls({
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
  isInfiniteMode = false,
  recordingDuration = 0,
  error,
  onDifficultyChange,
  onFrequencyChange,
  isPro = false,
  isAuthenticated = false,
  onUpgrade,
  mode = 'solo',
}: PracticeControlsProps) {
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) {
      return '0:00'
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
          'bg-accent-green/10 text-accent-green border-accent-green/20 hover:bg-accent-green/20',
      }
    }
    if (difficulty === 2) {
      return {
        label: 'Medium',
        classes:
          'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20 hover:bg-accent-yellow/20',
      }
    }
    if (difficulty === 3) {
      return {
        label: 'Hard',
        classes: 'bg-accent-red/10 text-accent-red border-accent-red/20 hover:bg-accent-red/20',
      }
    }
    return {
      label: 'Random',
      classes:
        'bg-accent-purple/10 text-accent-purple border-accent-purple/20 hover:bg-accent-purple/20',
    }
  }

  const difficultyMeta = getDifficultyMeta()
  const intervalProgress = getIntervalProgress(currentTime || 0, selectedBeat.bpm, frequency)

  // PWA Prompt State
  const [showPWAInstall, setShowPWAInstall] = useState(false)

  const handleRecordClick = () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('hasWarnedPWA')) {
      setShowPWAInstall(true)
      localStorage.setItem('hasWarnedPWA', 'true')
      return
    }

    if (!isAuthenticated && !isPlaying) {
      onUpgrade?.()
      return
    }

    if (!isPro && !isPlaying) {
      onUpgrade?.()
      return
    }
    onToggle()
  }

  const cycleDifficulty = () => {
    if (!onDifficultyChange) return
    const nextDiff = difficulty >= 4 ? 1 : difficulty + 1
    onDifficultyChange(nextDiff)
  }

  const cycleFrequency = () => {
    if (!onFrequencyChange) return
    const nextFreq = frequency === 2 ? 4 : frequency === 4 ? 8 : 2
    onFrequencyChange(nextFreq)
  }

  // Custom Studio Mic Icon
  const StudioMicIcon = ({ className, size = 48 }: { className?: string; size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  )

  return (
    <Card padding="lg" className={cn('transition-opacity duration-500 bg-transparent border-none')}>
      <div className="flex flex-col items-center gap-4 sm:gap-6">
        {/* Info Tags (Standardized) */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2">
            <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 flex items-center gap-2">
              <User size={12} className="text-white/40" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                {mode}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-wider">
            <button
              onClick={cycleDifficulty}
              disabled={!onDifficultyChange}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[0.7rem] font-bold border transition-all',
                difficultyMeta.classes,
                !onDifficultyChange && 'cursor-default'
              )}
            >
              <Gauge size={12} />
              <span>{difficultyMeta.label}</span>
            </button>

            <span className="text-xs font-bold text-white/20">{selectedBeat.bpm} BPM</span>

            <button
              onClick={cycleFrequency}
              disabled={!onFrequencyChange}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[0.7rem] font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors',
                !onFrequencyChange && 'cursor-default opacity-50'
              )}
            >
              <Zap
                size={12}
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
        <div id="tour-word-prompt" className="flex w-full items-center justify-center h-20">
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
              className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 text-[0.7rem] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
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

        {/* Hero Player */}
        <div className="relative flex items-center justify-center">
          <motion.button
            id="tour-record-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={
              isPlaying
                ? isRecording && !isInfiniteMode
                  ? { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 1.5 } }
                  : { scale: 1 }
                : { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 3 } }
            }
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(10)
              }
              handleRecordClick()
            }}
            disabled={isLoading}
            className={cn(
              'relative flex items-center justify-center rounded-full transition-all duration-500 group outline-none',
              'w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px]',
              'border backdrop-blur-md shadow-2xl overflow-hidden',
              isPlaying
                ? isRecording && !isInfiniteMode
                  ? 'border-red-500/50 bg-black/40 shadow-red-glow'
                  : 'border-accent-purple/30 bg-black/40 shadow-purple-glow'
                : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'
            )}
          >
            {/* Ambient Glows */}
            <div
              className={cn(
                'absolute inset-0 rounded-full opacity-0 transition-opacity duration-700',
                isPlaying && 'opacity-100'
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/10 to-transparent blur-3xl" />
            </div>

            {/* Timer Ring */}
            <div className="absolute inset-0 p-6 flex items-center justify-center">
              <TimerRing
                progress={intervalProgress}
                size={340}
                className={cn(
                  'w-full h-full text-white/5 transition-colors duration-500',
                  isPlaying && 'text-accent-purple drop-shadow-neon'
                )}
                strokeWidth={3}
              />
            </div>

            {/* Inner Content - Flex Center Column */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full">
              {isPlaying ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="flex items-center gap-2">
                    {isRecording && !isInfiniteMode && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-[0.3em]',
                        isRecording && !isInfiniteMode ? 'text-red-400' : 'text-accent-purple'
                      )}
                    >
                      {isInfiniteMode ? 'Free Flow' : isRecording ? 'Recording' : 'Playing'}
                    </span>
                  </div>

                  <span className="text-6xl sm:text-7xl font-light text-white tabular-nums tracking-tighter leading-none">
                    {isInfiniteMode ? (
                      <InfinityIcon size={64} className="text-white/80 animate-pulse-slow" />
                    ) : isRecording ? (
                      formatTime(Math.max(0, (isPro ? 600 : 120) - recordingDuration))
                    ) : (
                      formatTime(Math.max(0, sessionDuration - (currentTime || 0)))
                    )}
                  </span>

                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-4">
                    Tap to Stop
                  </span>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-16 w-16 rounded-full border-2 border-accent-purple/20 border-t-accent-purple animate-spin" />
                  <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Preparing Studio
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <div className="flex flex-col items-center gap-8">
                    <h2 className="text-6xl sm:text-7xl font-light tracking-[0.25em] text-white/90 uppercase leading-none animate-in fade-in zoom-in-95 duration-700">
                      Ready
                    </h2>

                    <div
                      className={cn(
                        'h-28 w-28 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 relative overflow-hidden group-hover:scale-105',
                        !isPro
                          ? 'bg-white/5 border border-white/10 text-white/20'
                          : 'bg-red-500 text-white shadow-red-500/20'
                      )}
                    >
                      {isPro && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                      )}
                      <StudioMicIcon size={48} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.button>
        </div>

        {/* Record Notifier */}
        <button
          onClick={handleRecordClick}
          className="mt-4 flex items-center justify-center group/rec outline-none transition-transform hover:scale-105 active:scale-95"
        >
          <div className="flex items-center gap-2 px-6 py-2">
            {/* Left Bracket */}
            <div className="w-2.5 h-10 border-l-[3px] border-t-[3px] border-b-[3px] border-black" />

            <div className="flex items-center gap-3 mx-1">
              {/* Dot */}
              <div
                className={cn(
                  'h-6 w-6 rounded-full transition-colors',
                  isPro ? 'bg-red-600' : 'bg-[#D1D1D1]',
                  isRecording && 'animate-pulse'
                )}
              />
              {/* Text */}
              <span className="text-3xl font-black tracking-tighter text-black">REC</span>
            </div>

            {/* Right Bracket */}
            <div className="w-2.5 h-10 border-r-[3px] border-t-[3px] border-b-[3px] border-black" />
          </div>
        </button>
      </div>

      <PWAInstallModal
        isOpen={showPWAInstall}
        onClose={() => {
          setShowPWAInstall(false)
          // Optionally auto-start after closing? User said "prompt before", usually implies "read this first".
          // We'll let them click record again to start.
        }}
      />
    </Card>
  )
}

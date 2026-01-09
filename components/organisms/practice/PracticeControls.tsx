'use client'

import { Card } from '@/components/atoms/Card'
import { RefreshCcw, Zap, Gauge, Mic, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { BeatDropdown } from '@/components/molecules/practice/BeatDropdown'
import { TimerRing } from '@/components/atoms/TimerRing'
import { Beat } from '@/types/database'
import { cn } from '@/lib/utils'
import { getIntervalProgress } from '@/lib/beats/utils'

interface PracticeControlsProps {
  selectedBeat: Beat
  beats: Beat[]
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  sessionDuration: number
  handleToggle: () => void
  handleRestart?: () => void
  handleBeatSelect: (beat: Beat) => void
  difficulty: number
  frequency: number
  recordingDuration?: number
  isPro?: boolean
  isInfiniteMode?: boolean
  currentWord?: string
  countdownValue?: number | 'GO' | null
  isRecording?: boolean
  isAuthenticated?: boolean
  handleUpgrade?: () => void
  handleDifficultyChange?: (value: number) => void
  handleFrequencyChange?: (value: number) => void
  error?: string
  isRecordingEnabled?: boolean
}

export default function PracticeControls(props: PracticeControlsProps) {
  const {
    selectedBeat,
    beats,
    isPlaying,
    isLoading,
    currentTime,
    sessionDuration,
    handleToggle,
    handleRestart,
    handleBeatSelect,
    difficulty,
    frequency,
    isInfiniteMode = false,
    recordingDuration = 0,
    isPro = false,
  } = props

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
        classes:
          'bg-accent-red/10 text-accent-red border-accent-red/20 hover:bg-accent-red/20',
      }
    }
    return {
      label: 'Mixed',
      classes:
        'bg-accent-purple/10 text-accent-purple border-accent-purple/20 hover:bg-accent-purple/20',
    }
  }

  const difficultyMeta = getDifficultyMeta()
  const progress = (currentTime / sessionDuration) * 100
  const intervalProgress = getIntervalProgress(
    currentTime,
    selectedBeat?.bpm || 90,
    frequency
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
      <div className="max-w-screen-xl mx-auto space-y-4">
        {/* Main Control Card */}
        <Card className="relative overflow-hidden bg-black/60 backdrop-blur-2xl border-white/10 shadow-2xl rounded-[2.5rem] p-6">
          {/* Progress Bar (at very top of card) */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-accent-purple"
            />
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Beat Selection - Simplified for Mobile */}
            <div className="flex-1 min-w-0 w-full lg:w-auto">
              <BeatDropdown
                beats={beats}
                selectedBeat={selectedBeat}
                handleSelect={handleBeatSelect}
                isPro={isPro}
                isLoading={isLoading}
                embedded={false}
              />
            </div>

            {/* Main Action Group */}
            <div className="flex items-center gap-6 lg:gap-8">
              {/* Reset/Restart */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: -180 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRestart}
                className="p-3 rounded-2xl bg-white/5 text-text-tertiary hover:text-white hover:bg-white/10 transition-all border border-white/5"
              >
                <RefreshCcw size={22} />
              </motion.button>

              {/* RECORD / PLAY BUTTON */}
              <motion.button
                whileHover={!isLoading ? { scale: 1.05 } : {}}
                whileTap={!isLoading ? { scale: 0.95 } : {}}
                onClick={handleToggle}
                disabled={isLoading}
                className={cn(
                  'relative group flex items-center justify-center p-0.5 rounded-[2rem] transition-all duration-500',
                  isPlaying
                    ? 'bg-gradient-to-br from-accent-red to-orange-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                    : 'bg-gradient-to-br from-accent-purple to-accent-blue shadow-[0_0_30px_rgba(125,122,255,0.3)]',
                  isLoading && 'opacity-50 grayscale cursor-not-allowed'
                )}
              >
                <div className="bg-black/20 backdrop-blur-sm rounded-[1.9rem] px-8 py-4 flex items-center gap-4 border border-white/10 group-hover:bg-transparent transition-colors">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500',
                      isPlaying
                        ? 'bg-white text-accent-red animate-pulse'
                        : 'bg-white text-accent-purple'
                    )}
                  >
                    {isPlaying ? (
                      <Mic size={24} className="fill-current" />
                    ) : (
                      <Play size={24} className="fill-current ml-1" />
                    )}
                  </div>
                  <div className="flex flex-col items-start pr-2">
                    <span className="text-sm font-black uppercase tracking-widest text-white/70">
                      {isLoading
                        ? 'Loading'
                        : isPlaying
                          ? 'Recording'
                          : 'Start Flow'}
                    </span>
                    <span className="text-xl font-black text-white leading-tight">
                      {isPlaying ? formatTime(recordingDuration) : "LET'S DROP"}
                    </span>
                  </div>
                </div>
              </motion.button>

              {/* Timer/Duration View */}
              <div className="text-right">
                <div className="text-2xl font-black text-white flex items-center gap-3 tabular-nums leading-none">
                  {formatTime(currentTime)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
                  <span className="text-xs font-bold text-text-tertiary tracking-widest uppercase">
                    Session Time
                  </span>
                </div>
              </div>
            </div>

            {/* Session Stats/Settings (Hidden on mobile maybe?) */}
            <div className="hidden lg:flex items-center gap-8 pl-8 border-l border-white/10">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">
                  Words
                </span>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-accent-blue/10 rounded-lg text-accent-blue">
                    <Zap size={14} />
                  </div>
                  <span className="text-lg font-black text-white uppercase">
                    {frequency} Bars
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">
                  Level
                </span>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-1.5 rounded-xl border border-white/5 transition-all',
                    difficultyMeta.classes
                  )}
                >
                  <Gauge size={14} />
                  <span className="text-sm font-black uppercase tracking-wider">
                    {difficultyMeta.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* WordPrompt Context Row (Floating above main bar) */}
        {!isInfiniteMode && (
          <div className="flex justify-center -mb-2">
            <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl px-6 py-2 flex items-center gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center">
                  <TimerRing
                    progress={intervalProgress}
                    size={24}
                    strokeWidth={3}
                    className="text-accent-purple"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-tertiary uppercase tracking-wider">
                    Next Word
                  </span>
                  <span className="text-xs font-bold text-white uppercase">
                    {frequency} Bar Interval
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

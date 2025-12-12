'use client'

import { useEffect } from 'react'

import { Card } from '@/components/atoms/Card'
import { PlayButton } from '@/components/molecules/practice/PlayButton'
import { WordPrompt } from '@/components/molecules/practice/WordPrompt'
import { RecordingIndicator } from '@/components/molecules/practice/RecordingIndicator'
import { Beat } from '@/types/database'
import { cn } from '@/lib/utils'
import { getIntervalProgress } from '@/lib/beats/utils'
import { useWakeLock } from '@/hooks/useWakeLock'

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

  // Calculate timer ring progress (Countdown to next word)
  // We want the ring to fill up as we approach the next word change
  const intervalProgress = getIntervalProgress(currentTime || 0, selectedBeat.bpm, frequency)

  // Wake Lock for Recording
  const { requestLock, releaseLock } = useWakeLock()

  useEffect(() => {
    if (isRecording) {
      requestLock()
    } else {
      releaseLock()
    }
  }, [isRecording, requestLock, releaseLock])

  return (
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Main Orb Player */}
      <div className="relative flex items-center justify-center">
        {/* Outer Glow/Ring Container */}
        <div className="relative flex items-center justify-center rounded-full border border-stroke-glow/40 bg-background-card/60 p-8 shadow-neon backdrop-blur-medium transition-all duration-300">
           {/* Animated Background Ring */}
           {isPlaying && (
              <div
                className="absolute inset-4 animate-orbital-glow rounded-full border border-accent-purple/20"
                aria-hidden
              />
           )}
           
           {/* The Interactive Play Button / Ring */}
           <div className="relative z-10">
              <PlayButton
                isPlaying={isPlaying}
                progress={intervalProgress}
                onToggle={onToggle}
                disabled={!selectedBeat || isLoading}
                size={Math.max(playButtonSize, 220)} // Enforce larger size for orb look
              />
           </div>

           {/* Central Text Overlay (Only shows when not playing/hovering? Or always?
               The PlayButton component handles the central icon/text usually.
               Let's make sure PlayButton looks right. 
               Actually the Landing page has text overlay on top of the ring.
               Let's modify this to match the LandingHero exactly.
           */}
           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {!isPlaying && !isLoading && (
                 <div className="mt-16 text-sm font-medium tracking-widest uppercase text-text-secondary animate-pulse">
                    Press Play
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Session Details / Word Prompt */}
      <div className="w-full max-w-2xl space-y-6 text-center">
        {/* Word Prompt area */}
        <div className="min-h-[80px] flex items-center justify-center">
           <WordPrompt
             word={currentWord || null}
             show={isPlaying && !!currentWord}
             isGolden={isGolden}
           />
        </div>
        
        {/* Controls / Metadata */}
        <div className="flex items-center justify-center gap-4 text-sm">
           <div className={cn(
             'px-3 py-1 rounded-full border border-white/10 bg-white/5 text-text-secondary font-medium',
             difficultyMeta.classes
           )}>
             {difficultyMeta.label}
           </div>
           
           <div className="text-4xl font-light tabular-nums text-white">
             {formatTime(Math.max(0, sessionDuration - (currentTime || 0)))}
           </div>
           
           <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-text-secondary font-medium">
             {frequencyMeta.label}
           </div>
        </div>
        
        {/* Recording Status */}
        <div className="flex justify-center">
          <RecordingIndicator
            isRecording={(isRecording || isPlaying) && !micPermissionError}
            duration={recordingDuration}
            maxDuration={sessionDuration}
            showDuration={false}
          />
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'

import { PlayButton } from '@/components/molecules/practice/PlayButton'
import { WordPrompt } from '@/components/molecules/practice/WordPrompt'
import { RecordingIndicator } from '@/components/molecules/practice/RecordingIndicator'
import { Beat } from '@/types/database'
import { cn } from '@/lib/utils'
import { getIntervalProgress } from '@/lib/beats/utils'
import { useWakeLock } from '@/hooks/useWakeLock'
import { GlassyDropdown } from '@/components/molecules/display/GlassyDropdown'

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
  isPro?: boolean
  countdownValue?: number | 'GO' | null
  onSkipWord?: () => void
  onDifficultyChange?: (value: number) => void
  onFrequencyChange?: (value: number) => void
  onRecordingClick?: () => void
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
  isPro = false,
  countdownValue = null,
  onSkipWord, // Use the prop directly
  onDifficultyChange,
  onFrequencyChange,
  onRecordingClick,
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

          {/* Central Display: Countdown OR Play Button/Word */}
          <div className="relative z-10 flex justify-center items-center">
            {countdownValue ? (
              <div className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md border border-accent-red/30 animate-in zoom-in duration-300">
                <span
                  className={cn(
                    'text-8xl font-black italic tracking-tighter',
                    countdownValue === 'GO' ? 'text-white' : 'text-accent-red animate-pulse'
                  )}
                >
                  {countdownValue}
                </span>
              </div>
            ) : (
              <PlayButton
                isPlaying={isPlaying}
                onToggle={onToggle}
                currentWord={currentWord}
                progress={intervalProgress}
                size={playButtonSize}
                isGolden={isGolden}
                onSkipWord={onSkipWord} // Corrected from _onSkipWord which was likely a typo in previous context
              />
            )}
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
        <div className="flex items-center justify-center gap-4 text-sm z-20 relative">
          <GlassyDropdown
            label="Diff"
            value={difficulty}
            options={[
              { label: 'Easy', value: 1 },
              { label: 'Medium', value: 2 },
              { label: 'Hard', value: 3 },
            ]}
            onChange={onDifficultyChange!}
          />

          <div className="text-4xl font-light tabular-nums text-white min-w-[120px]">
            {formatTime(Math.max(0, sessionDuration - (currentTime || 0)))}
          </div>

          <GlassyDropdown
            label="Freq"
            value={frequency}
            options={[
              { label: '2 Bars', value: 2 },
              { label: '4 Bars', value: 4 },
              { label: '8 Bars', value: 8 },
            ]}
            onChange={onFrequencyChange!}
          />
        </div>

        {/* Recording Status */}
        <div className="flex justify-center">
          <button 
             onClick={onRecordingClick}
             className="focus:outline-none hover:opacity-80 transition-opacity rounded-full"
             title={isPro ? "Recording Active" : "Unlock Recording"}
          >
             <RecordingIndicator
               isRecording={(isRecording || isPlaying) && !micPermissionError}
               duration={recordingDuration}
               maxDuration={sessionDuration}
               isPro={isPro}
               showDuration={false}
             />
          </button>
        </div>
      </div>
    </div>
  )
}

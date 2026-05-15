import { BeatDropdown } from '@/components/molecules/practice/BeatDropdown'
import { Gauge, User, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Beat } from '@/types/database'
import { SESSION_CONFIG } from '@/lib/constants/design'

interface PracticeTopControlsProps {
  beats: Beat[]
  selectedBeat: Beat
  handleBeatSelect: (beat: Beat) => void
  isPro: boolean
  isPlaying: boolean
  isPaused: boolean
  difficulty: number
  activeDifficulty?: number
  handleDifficultyChange?: (value: number) => void
  mode: string
  frequency: number
  activeFrequency?: number
  handleFrequencyChange?: (value: number) => void
}

export function PracticeTopControls({
  beats,
  selectedBeat,
  handleBeatSelect,
  isPro,
  isPlaying,
  isPaused,
  difficulty,
  activeDifficulty = difficulty,
  handleDifficultyChange,
  mode,
  frequency,
  activeFrequency = frequency,
  handleFrequencyChange,
}: PracticeTopControlsProps) {
  const isSessionActive = isPlaying || isPaused
  const hasPendingDifficulty =
    isSessionActive && difficulty !== activeDifficulty
  const hasPendingFrequency = isSessionActive && frequency !== activeFrequency

  const displayDifficulty = isSessionActive ? activeDifficulty : difficulty
  const displayFrequency = isSessionActive ? activeFrequency : frequency

  const getDifficultyMeta = (value: number) => {
    if (value <= 1) {
      return {
        label: 'Easy',
        classes:
          'bg-accent-green/10 text-accent-green border-accent-green/20 hover:bg-accent-green/20',
      }
    }
    if (value === 2) {
      return {
        label: 'Medium',
        classes:
          'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20 hover:bg-accent-yellow/20',
      }
    }
    if (value === 3) {
      return {
        label: 'Hard',
        classes:
          'bg-accent-red/10 text-accent-red border-accent-red/20 hover:bg-accent-red/20',
      }
    }
    return {
      label: 'Random',
      classes:
        'bg-accent-purple/10 text-accent-purple border-accent-purple/20 hover:bg-accent-purple/20',
    }
  }

  const difficultyMeta = getDifficultyMeta(displayDifficulty)
  const pendingDifficultyMeta = getDifficultyMeta(difficulty)

  const cycleDifficulty = () => {
    if (!handleDifficultyChange) return
    const nextDiff = difficulty >= 4 ? 1 : difficulty + 1
    handleDifficultyChange(nextDiff)
  }

  const cycleFrequency = () => {
    if (!handleFrequencyChange) return
    const options = SESSION_CONFIG.FREQUENCY_OPTIONS
    const currentIndex = options.indexOf(frequency as (typeof options)[number])
    const nextFreq = options[(currentIndex + 1) % options.length] || options[0]
    handleFrequencyChange(nextFreq)
  }

  return (
    <div className="w-full flex-none flex flex-col items-center justify-end pb-4 gap-4 shrink-0 relative z-40 pointer-events-none">
      {/* Beat Dropdown (Pointer Events Auto) */}
      <div className="pointer-events-auto w-full flex justify-center">
        <BeatDropdown
          beats={beats}
          selectedBeat={selectedBeat}
          handleSelect={handleBeatSelect}
          isPro={isPro}
          disabled={false}
          embedded={true}
          defaultCollapsed={true}
          overlay
        />
      </div>

      {/* Info Pills (Pointer Events Auto) - Moved from Center */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-md relative z-20 pointer-events-auto">
        {/* Difficulty Pill */}
        <button
          data-testid="practice-difficulty-pill"
          onClick={cycleDifficulty}
          disabled={!handleDifficultyChange}
          className={cn(
            'flex-1 h-12 rounded-full border bg-white/5 backdrop-blur-sm flex items-center justify-center gap-2 transition-all hover:bg-white/10',
            difficultyMeta.classes,
            !handleDifficultyChange && 'cursor-default'
          )}
          title={
            hasPendingDifficulty
              ? `Next: ${pendingDifficultyMeta.label}`
              : `Difficulty: ${difficultyMeta.label}`
          }
        >
          <Gauge size={14} />
          <span className="flex flex-col items-start leading-none">
            <span className="text-[0.7rem] sm:text-xs font-bold uppercase tracking-widest truncate">
              {difficultyMeta.label}
            </span>
            {hasPendingDifficulty && (
              <span className="text-[0.55rem] sm:text-[0.6rem] font-semibold uppercase tracking-widest text-white/50">
                Next: {pendingDifficultyMeta.label}
              </span>
            )}
          </span>
        </button>

        {/* Mode Pill */}
        <div className="flex-[1.5] h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center gap-2 transition-all hover:bg-white/10">
          <User size={14} className="text-white/60" />
          <span className="text-[0.7rem] sm:text-xs font-bold uppercase tracking-widest text-white/80">
            {mode}
          </span>
        </div>

        {/* Bars Pill */}
        <button
          data-testid="practice-frequency-pill"
          onClick={cycleFrequency}
          disabled={!handleFrequencyChange}
          className={cn(
            'flex-1 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center gap-2 transition-all hover:bg-white/10',
            !handleFrequencyChange && 'cursor-default opacity-50'
          )}
          title={
            hasPendingFrequency
              ? `Next: ${frequency} Bars`
              : `Frequency: ${displayFrequency} Bars`
          }
        >
          <Zap
            size={14}
            className={
              displayFrequency === 2
                ? 'text-accent-red'
                : displayFrequency === 4
                  ? 'text-accent-yellow'
                  : 'text-accent-blue'
            }
          />
          <span className="flex flex-col items-start leading-none">
            <span className="text-[0.7rem] sm:text-xs font-bold uppercase tracking-widest text-white/80 whitespace-nowrap">
              {displayFrequency} Bars
            </span>
            {hasPendingFrequency && (
              <span className="text-[0.55rem] sm:text-[0.6rem] font-semibold uppercase tracking-widest text-white/50 whitespace-nowrap">
                Next: {frequency} Bars
              </span>
            )}
          </span>
        </button>
      </div>
    </div>
  )
}

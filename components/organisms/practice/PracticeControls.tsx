import { Card } from '@/components/atoms/Card'
import {
  RefreshCcw,
  Zap,
  Gauge,
  Infinity as InfinityIcon,
  User,
  Mic,
  Pause,
  Play,
  LogOut,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { BeatDropdown } from '@/components/molecules/practice/BeatDropdown'
import { TimerRing } from '@/components/atoms/TimerRing'
import { AudioVisualizer } from '@/components/molecules/visuals/AudioVisualizer'
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
  isGolden?: boolean
  isRecording?: boolean
  isInfiniteMode?: boolean
  recordingDuration?: number
  error?: string | null
  handleDifficultyChange?: (value: number) => void
  handleFrequencyChange?: (value: number) => void
  isPro?: boolean
  isAuthenticated?: boolean
  handleUpgrade?: () => void
  mode?: 'solo' | 'cypher'
  isRecordingEnabled?: boolean
  currentWord?: string
  countdownValue?: number | 'GO' | null
  isSirenActive?: boolean
  sirenPhase?: number
  activePlayer?: number
  cypherPlayers?: number
  isPaused?: boolean
  onTogglePause?: () => void
  onDiscard?: () => void
  wordTiming?: { start: number; duration: number }
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
    isGolden = false,
    isRecording = false,
    isInfiniteMode = false,
    recordingDuration = 0,
    error,
    handleDifficultyChange,
    handleFrequencyChange,
    isPro = false,
    isAuthenticated = false,
    handleUpgrade,
    mode = 'solo',
    isRecordingEnabled = true,
    currentWord,
    countdownValue,
    isSirenActive = false,
    sirenPhase = 0,
    activePlayer = 1,
    cypherPlayers = 1,
    isPaused = false,
    onTogglePause,
    onDiscard,
    wordTiming,
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
      label: 'Random',
      classes:
        'bg-accent-purple/10 text-accent-purple border-accent-purple/20 hover:bg-accent-purple/20',
    }
  }

  const difficultyMeta = getDifficultyMeta()

  // Calculate progress relative to the WORD, not the global grid
  // This ensures that "Bridge Words" (transitional words) still get a full 0-100% timer
  let intervalProgress = 0
  if (wordTiming && wordTiming.duration > 0) {
    const elapsed = currentTime - wordTiming.start
    intervalProgress = Math.min(Math.max(elapsed / wordTiming.duration, 0), 1)
  } else {
    // Fallback for initialization
    intervalProgress = getIntervalProgress(
      currentTime || 0,
      selectedBeat?.bpm || 90,
      frequency
    )
  }

  const handleRecordClick = () => {
    if (!isAuthenticated && !isPlaying) {
      handleUpgrade?.()
      return
    }
    handleToggle()
  }

  const cycleDifficulty = () => {
    if (!handleDifficultyChange) return
    const nextDiff = difficulty >= 4 ? 1 : difficulty + 1
    handleDifficultyChange(nextDiff)
  }

  const cycleFrequency = () => {
    if (!handleFrequencyChange) return
    const nextFreq = frequency === 2 ? 4 : frequency === 4 ? 8 : 2
    handleFrequencyChange(nextFreq)
  }

  return (
    <Card
      padding="lg"
      className={cn(
        'transition-opacity duration-500 bg-transparent border-none h-full flex flex-col justify-between py-2'
      )}
    >
      <div className="flex flex-col items-center gap-2 sm:gap-6 w-full h-full justify-between">
        {/* Top Controls Section - Compact */}
        <div className="w-full flex flex-col items-center gap-2 sm:gap-4 shrink-0">
          <BeatDropdown
            beats={beats}
            selectedBeat={selectedBeat}
            handleSelect={handleBeatSelect}
            isPro={isPro}
            disabled={false}
            embedded={true}
            defaultCollapsed={true}
          />
        </div>

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
              disabled={!handleDifficultyChange}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[0.7rem] font-bold border transition-all',
                difficultyMeta.classes,
                !handleDifficultyChange && 'cursor-default'
              )}
            >
              <Gauge size={12} />
              <span>{difficultyMeta.label}</span>
            </button>

            <span className="text-xs font-bold text-white/20">
              {selectedBeat?.bpm || 90} BPM
            </span>

            <button
              onClick={cycleFrequency}
              disabled={!handleFrequencyChange}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[0.7rem] font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors',
                !handleFrequencyChange && 'cursor-default opacity-50'
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
          {handleRestart && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRestart}
              className="mt-1 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 text-text-tertiary hover:text-white hover:bg-white/10 text-[0.6rem] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5"
            >
              <RefreshCcw size={10} />
              <span>Restart</span>
            </motion.button>
          )}
        </div>

        </div>

        {/* Center Stage - Flexible */}
        <div className="flex-1 flex flex-col items-center justify-center w-full relative min-h-0">
          {error && (
            <div className="mb-4 text-red-400 text-sm text-center bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

        {/* Cypher Mode Indicator */}
        {/* Cypher Mode: Active Player Text (Floating above) */}
        {mode === 'cypher' && (
          <div className="absolute top-16 z-30 flex flex-col items-center animate-in fade-in slide-in-from-top-4">
             <span
                className={cn(
                  'text-lg font-black tracking-widest uppercase filter drop-shadow-lg transition-colors duration-300',
                  activePlayer === 1 && 'text-accent-purple',
                  activePlayer === 2 && 'text-accent-orange',
                  activePlayer === 3 && 'text-accent-gold',
                  activePlayer === 4 && 'text-accent-green',
                  activePlayer === 5 && 'text-accent-blue'
                )}
              >
                Player {activePlayer}
              </span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Your Turn
              </span>
          </div>
        )}

        {/* Hero Player - Centered */}
        <div className="relative flex items-center justify-center">
          {/* Radial Cypher Players */}
          {mode === 'cypher' && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              {Array.from({ length: cypherPlayers }).map((_, i) => {
                const pNum = i + 1
                const isActive = Number(activePlayer) === pNum
                
                // Radial Positioning
                // P1: NW (-45deg), P2: NE (45deg), P3: SE (135deg), P4: SW (225deg)
                // Radius approx 190px from center.
                // Using simple pre-calc classes for first 4, then fallback or rotation.
                // Since Tailwind doesn't have dynamic rotation, we use style.
                const angleDeg = -45 + (i * 90) // 0 -> -45, 1 -> 45, 2 -> 135, 3 -> 225
                const radius = 180 // px
                const x = radius * Math.sin(angleDeg * (Math.PI / 180))
                const y = -radius * Math.cos(angleDeg * (Math.PI / 180))

                // Color Mapping
                let colorClass = 'text-white border-white/20 bg-white/10'
                let shadowClass = ''
                if (isActive) {
                  switch (pNum) {
                    case 1: colorClass = 'text-accent-purple border-accent-purple bg-accent-purple/20'; shadowClass = 'shadow-[0_0_20px_rgba(168,85,247,0.5)]'; break;
                    case 2: colorClass = 'text-accent-orange border-accent-orange bg-accent-orange/20'; shadowClass = 'shadow-[0_0_20px_rgba(249,115,22,0.5)]'; break;
                    case 3: colorClass = 'text-accent-gold border-accent-gold bg-accent-gold/20'; shadowClass = 'shadow-[0_0_20px_rgba(255,214,10,0.5)]'; break;
                    case 4: colorClass = 'text-accent-green border-accent-green bg-accent-green/20'; shadowClass = 'shadow-[0_0_20px_rgba(48,209,88,0.5)]'; break;
                    default: colorClass = 'text-accent-blue border-accent-blue bg-accent-blue/20'; shadowClass = 'shadow-[0_0_20px_rgba(10,132,255,0.5)]'; break;
                  }
                } else {
                  colorClass = 'text-white/20 border-white/5 bg-white/5'
                }

                return (
                  <div
                    key={i}
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      left: '50%',
                      top: '50%',
                    }}
                    className={cn(
                      'absolute flex items-center justify-center rounded-full border-2 transition-all duration-500 backdrop-blur-md',
                      isActive
                        ? 'w-16 h-16 scale-110 z-30'
                        : 'w-10 h-10 opacity-50 z-10',
                      colorClass,
                      shadowClass
                    )}
                  >
                     <User
                      size={isActive ? 28 : 18}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                     {isActive && (
                      <div className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                     )}
                     
                     {/* Player Label */}
                     <span className={cn(
                        "absolute -top-6 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-opacity",
                        isActive ? "opacity-100 text-white" : "opacity-0"
                     )}>
                        Player {pNum}
                     </span>
                  </div>
                )
              })}
            </div>
          )}
          <motion.button
            id="tour-record-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={
              isPlaying
                ? isRecording && !isInfiniteMode
                  ? {
                      scale: [1, 1.02, 1],
                      transition: { repeat: Infinity, duration: 1.5 },
                    }
                  : { scale: 1 }
                : {
                    scale: [1, 1.02, 1],
                    transition: { repeat: Infinity, duration: 3 },
                  }
            }
            onClick={() => {
              if (
                isRecordingEnabled &&
                typeof navigator !== 'undefined' &&
                navigator.vibrate
              ) {
                navigator.vibrate(10)
              }
              handleRecordClick()
            }}
            disabled={isLoading}
            className={cn(
              'relative flex items-center justify-center rounded-full transition-all duration-500 group outline-none shrink-0',
              // Responsive size: defaults to smaller on mobile, scales up on larger screens
              'w-[min(70vmin,260px)] h-[min(70vmin,260px)] sm:w-[300px] sm:h-[300px]',
              'border backdrop-blur-md shadow-2xl overflow-hidden',
              isPlaying
                ? isRecording && !isInfiniteMode
                  ? 'border-red-500/50 bg-black/40 shadow-red-glow'
                  : 'border-accent-purple/30 bg-black/40 shadow-purple-glow'
                : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'
            )}
          >
            {/* Visualizer Background */}
            <div className="absolute inset-0 z-0 opacity-60 scale-125">
              <AudioVisualizer isPlaying={isPlaying || isRecording} />
            </div>

            {/* Ambient Siren Glows */}
            <div
              className={cn(
                'absolute inset-0 rounded-full blur-[80px] opacity-0 transition-all duration-300',
                isPlaying && 'opacity-20',
                isSirenActive &&
                  (sirenPhase === 0
                    ? 'bg-red-600 opacity-40 scale-125'
                    : 'bg-blue-600 opacity-40 scale-125')
              )}
            />

            {/* Ambient Background Glow (Original) */}
            <div
              className={cn(
                'absolute inset-0 rounded-full opacity-0 transition-opacity duration-700',
                isPlaying && !isSirenActive && 'opacity-100'
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/10 to-transparent blur-3xl" />
            </div>

            {/* Timer Ring */}
            <div className="absolute inset-0 p-6 flex items-center justify-center pointer-events-none">
              <TimerRing
                progress={intervalProgress}
                isSirenActive={isSirenActive}
                sirenPhase={sirenPhase}
                size={300}
                className={cn(
                  'w-full h-full text-white/5 transition-colors duration-500',
                  isPlaying &&
                    !isSirenActive &&
                    'text-accent-purple drop-shadow-neon'
                )}
                strokeWidth={3}
              />
            </div>

            {/* Inner Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              {isPlaying ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  {currentWord ? (
                    // Display Word if Active
                    <motion.div
                      key={currentWord}
                      initial={{
                        opacity: 0,
                        scale: 0.5,
                        filter: 'blur(10px)',
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        filter: 'blur(0px)',
                        rotate: [-1, 1, -1, 0],
                      }}
                      exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                      transition={{
                        type: 'spring',
                        duration: 0.4,
                        bounce: 0.4,
                      }}
                      className="flex flex-col items-center justify-center w-full max-w-[85%] px-2"
                    >
                      <h1
                        className={cn(
                          'font-black text-transparent bg-clip-text tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] break-words text-balance uppercase leading-none transition-all duration-300',
                          // Dynamic font sizing
                          currentWord.length > 12
                            ? 'text-2xl sm:text-3xl'
                            : currentWord.length > 8
                              ? 'text-3xl sm:text-4xl'
                              : 'text-4xl sm:text-5xl',
                          isGolden
                            ? 'bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600'
                            : 'bg-gradient-to-br from-white via-white to-white/70'
                        )}
                      >
                        {currentWord}
                      </h1>
                      {/* Session Timer Below Word */}
                      <span className="text-3xl font-medium text-white/60 tabular-nums mt-4 drop-shadow-md">
                        {formatTime(
                          Math.max(0, sessionDuration - (currentTime || 0))
                        )}
                      </span>
                    </motion.div>
                  ) : countdownValue ? (
                    <motion.div
                      key={countdownValue}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1.2 }}
                      exit={{ opacity: 0, scale: 1.5 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <span className="text-7xl sm:text-8xl font-black text-white drop-shadow-neon">
                        {countdownValue}
                      </span>
                      <span className="text-xl font-bold text-accent-purple tracking-widest uppercase mt-2">
                        Get Ready
                      </span>
                    </motion.div>
                  ) : (
                    <>
                      {/* Standard Timer View */}
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
                            isRecording && !isInfiniteMode
                              ? 'text-red-400'
                              : 'text-accent-purple'
                          )}
                        >
                          {isInfiniteMode
                            ? 'Free Flow'
                            : isRecording
                              ? 'Recording'
                              : 'Playing'}
                        </span>
                      </div>

                      <span className="text-6xl sm:text-7xl font-light text-white tabular-nums tracking-tighter leading-none">
                        {isInfiniteMode ? (
                          <InfinityIcon
                            size={64}
                            className="text-white/80 animate-pulse-slow"
                          />
                        ) : isRecording ? (
                          formatTime(
                            Math.max(
                              0,
                              (isPro ? 600 : 120) - (recordingDuration || 0)
                            )
                          )
                        ) : (
                          formatTime(
                            Math.max(0, sessionDuration - (currentTime || 0))
                          )
                        )}
                      </span>
                    </>
                  )}
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-16 w-16 rounded-full border-2 border-accent-purple/20 border-t-accent-purple animate-spin" />
                  <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Preparing Studio
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={cn(
                      'h-28 w-28 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 relative overflow-hidden group-hover:scale-105',
                      !isPro || !isRecordingEnabled
                        ? 'bg-white/5 border border-white/10 text-white/20'
                        : 'bg-red-500 text-white shadow-red-500/20'
                    )}
                  >
                    {isPro && isRecordingEnabled && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                    )}
                    <Mic
                      size={48}
                      strokeWidth={1.5}
                      className="text-white/90 drop-shadow-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.button>
        </div>

        {/* Record Notifier / Bottom Control Area */}
        <div className="h-20 flex items-center justify-center shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (isRecordingEnabled) handleUpgrade?.()
            }}
            className={cn(
              'flex items-center justify-center outline-none transition-transform hover:scale-105 active:scale-95 relative',
              !isRecordingEnabled && 'opacity-30 grayscale cursor-default'
            )}
          >
          <div className="flex items-center gap-2 px-6 py-2">
            {/* Left Bracket */}
            <div className="w-2.5 h-10 border-l-[3px] border-t-[3px] border-b-[3px] border-white/40 rounded-l-sm" />

            <div className="flex items-center gap-3 mx-1">
              {/* Dot */}
              <div
                className={cn(
                  'h-6 w-6 rounded-full transition-colors shadow-[0_0_10px_rgba(255,0,0,0.5)]',
                  isPro && isRecordingEnabled ? 'bg-red-500' : 'bg-red-900/50',
                  isRecording &&
                    'animate-pulse bg-red-500 shadow-[0_0_20px_rgba(255,0,0,0.8)]'
                )}
              />
              {/* Text */}
              <span className="text-3xl font-black tracking-tighter text-white/90 drop-shadow-lg">
                REC
              </span>
            </div>

            {/* Right Bracket */}
            <div className="w-2.5 h-10 border-r-[3px] border-t-[3px] border-b-[3px] border-white/40 rounded-r-sm" />
          </div>
        </button>

        {/* Pause Control & Discard - Overlay on bottom area */}
        {isPlaying && onTogglePause && isRecordingEnabled && (
          <div className="absolute bottom-4 z-30 flex gap-4">
            {/* Discard Button (Only when paused or playing) */}
            {onDiscard && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDiscard()
                }}
                className="px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center gap-2 group"
              >
                <LogOut
                  size={16}
                  className="text-red-400 group-hover:text-red-300"
                />
                <span className="text-xs font-bold uppercase tracking-widest text-red-400 group-hover:text-red-300">
                  Discard
                </span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation()
                onTogglePause()
              }}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all flex items-center gap-2"
            >
              {isPaused ? (
                <>
                  <Play size={16} className="text-accent-green" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white">
                    Resume
                  </span>
                </>
              ) : (
                <>
                  <Pause size={16} className="text-accent-yellow" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white">
                    Pause
                  </span>
                </>
        {/* Pause Control & Discard - Overlay on bottom area */}
        {isPlaying && onTogglePause && isRecordingEnabled && (
          <div className="absolute bottom-4 z-30 flex gap-4">
            {/* Discard Button (Only when paused or playing) */}
            {onDiscard && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDiscard()
                }}
                className="px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center gap-2 group"
              >
                <LogOut
                  size={16}
                  className="text-red-400 group-hover:text-red-300"
                />
                <span className="text-xs font-bold uppercase tracking-widest text-red-400 group-hover:text-red-300">
                  Discard
                </span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation()
                onTogglePause()
              }}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all flex items-center gap-2"
            >
              {isPaused ? (
                <>
                  <Play size={16} className="text-accent-green" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white">
                    Resume
                  </span>
                </>
              ) : (
                <>
                  <Pause size={16} className="text-accent-yellow" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white">
                    Pause
                  </span>
                </>
              )}
            </button>
          </div>
        )}
        </div>
      </div>
    </Card>
  )
}

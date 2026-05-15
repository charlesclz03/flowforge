import { useState } from 'react'
import { Card } from '@/components/atoms/Card'
import { RefreshCcw, Pause, Mic, Infinity as InfinityIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { PracticeTopControls } from '@/components/molecules/practice/PracticeTopControls'
import { PracticePauseModal } from '@/components/molecules/practice/PracticePauseModal'
import { PracticeErrorBanner } from '@/components/molecules/practice/PracticeErrorBanner'
import { TimerRing } from '@/components/atoms/TimerRing'
import dynamic from 'next/dynamic'
const AudioVisualizer = dynamic(
  () =>
    import('@/components/molecules/visuals/AudioVisualizer').then(
      (mod) => mod.AudioVisualizer
    ),
  { ssr: false }
)
import { Beat } from '@/types/database'
import { cn } from '@/lib/utils'
import { getIntervalProgress } from '@/lib/beats/utils'
import { RECORDING_CONFIG } from '@/lib/constants/design'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

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
  activeDifficulty?: number
  frequency: number
  isGolden?: boolean
  isRecording?: boolean
  isInfiniteMode?: boolean
  recordingDuration?: number
  error?: string | null
  handleDifficultyChange?: (value: number) => void
  handleFrequencyChange?: (value: number) => void
  isPro?: boolean
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
  startTime?: number
  onToggleRecordingMode?: () => void
  wordTiming?: { start: number; duration: number }
  activeFrequency?: number
  loadingText?: string // [NEW]
  onRetrySave?: () => void // [NEW]
  isTTSEnabled?: boolean
  voiceStatus?: 'loading' | 'ready' | 'fallback' | 'unsupported'
  spokenPromptNotice?: string | null
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
    activeDifficulty = difficulty,
    frequency, // Target frequency (User Selection)
    activeFrequency = frequency, // Active frequency (Audio Engine) - defaults to target if not provided
    isGolden = false,
    isRecording = false,
    isInfiniteMode = false,
    recordingDuration = 0,
    error,
    handleDifficultyChange,
    handleFrequencyChange,
    isPro = false,
    handleUpgrade,
    mode = 'solo',
    isRecordingEnabled = true,
    currentWord,
    countdownValue,
    isSirenActive = false,
    sirenPhase = 0,
    activePlayer = 1,
    cypherPlayers = 4,
    isPaused = false,
    onTogglePause,
    startTime,
    wordTiming,
    loadingText = 'Preparing Studio', // Default
    onRetrySave, // [NEW]
    isTTSEnabled,
    voiceStatus,
    spokenPromptNotice,
  } = props

  // State for pause modal
  const [showPauseModal, setShowPauseModal] = useState(false)

  // Sentry Error Logging
  useEffect(() => {
    if (error) {
      Sentry.captureMessage(`Practice Session Error: ${error}`, 'error')
    }
  }, [error])

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) {
      return '0:00'
    }
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate progress relative to the WORD, not the global grid
  // This ensures that "Bridge Words" (transitional words) still get a full 0-100% timer
  let intervalProgress = 0
  if (wordTiming && wordTiming.duration > 0) {
    const elapsed = currentTime - wordTiming.start
    intervalProgress = Math.min(Math.max(elapsed / wordTiming.duration, 0), 1)
  } else {
    // Fallback: Use ACTIVE frequency (the one currently driving the word)
    intervalProgress = getIntervalProgress(
      currentTime || 0,
      selectedBeat?.bpm || 90,
      activeFrequency // <--- Use Active Frequency Here for Smooth Ring
    )
  }

  const handleRecordClick = () => {
    // START FIX: Allow guests to record (will trigger save/auth flow on completion)
    // if (!isAuthenticated && !isPlaying) {
    //   handleUpgrade?.()
    //   return
    // }
    // END FIX
    handleToggle()
  }

  return (
    <Card
      padding="lg"
      className={cn(
        'transition-opacity duration-500 bg-transparent border-none flex flex-col justify-between flex-1 min-h-0',
        // CENTERING FIX V4 (FINAL):
        // Removed dynamic padding and duplicate BottomNav.
        // Pure Flexbox Symmetrical Centering.
        // overflow-visible ensures glow is not clipped.
        'py-4 relative overflow-visible'
      )}
    >
      {/* Session Controls - MOVED to flank main button (Mockup Style) */}

      {/* Pause Modal */}
      <PracticePauseModal
        showPauseModal={showPauseModal}
        isPaused={isPaused}
        setShowPauseModal={setShowPauseModal}
        onTogglePause={onTogglePause}
        handleRestart={handleRestart}
      />

      {/* Top Controls Section */}
      <PracticeTopControls
        beats={beats}
        selectedBeat={selectedBeat}
        handleBeatSelect={handleBeatSelect}
        isPro={isPro}
        isPlaying={isPlaying}
        isPaused={isPaused}
        difficulty={difficulty}
        activeDifficulty={activeDifficulty}
        handleDifficultyChange={handleDifficultyChange}
        mode={mode}
        frequency={frequency}
        activeFrequency={activeFrequency}
        handleFrequencyChange={handleFrequencyChange}
      />

      {/* CENTER STAGE: Just the Player */}
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 relative z-20 overflow-visible">
        {/* Hero Player Container with Flanking Satellites - Centered relative to wrapper */}
        <div className="flex flex-col items-center w-full max-w-lg">
          <PracticeErrorBanner error={error} onRetrySave={onRetrySave} />

          {spokenPromptNotice && !error && (
            <div className="mb-4 flex flex-col items-center gap-1 text-accent-blue text-xs text-center bg-accent-blue/10 px-4 py-2 rounded-lg border border-accent-blue/20 pointer-events-auto z-50 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300">
              <span className="font-bold tracking-wider uppercase">
                Text-Only Prompts
              </span>
              <span className="opacity-90 leading-tight">
                {spokenPromptNotice}
              </span>
            </div>
          )}

          {!spokenPromptNotice &&
            isTTSEnabled &&
            voiceStatus === 'fallback' &&
            !error && (
              <div className="mb-4 flex flex-col items-center gap-1 text-accent-yellow text-xs text-center bg-accent-yellow/10 px-4 py-2 rounded-lg border border-accent-yellow/20 pointer-events-auto z-50 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300">
                <span className="font-bold tracking-wider uppercase">
                  Native Voice Missing
                </span>
                <span className="opacity-90 leading-tight">
                  Falling back to a standard robotic voice. Check browser
                  settings to install language packs.
                </span>
              </div>
            )}

          <div className="flex items-center justify-center gap-2 sm:gap-4 w-full px-2 relative z-10 pointer-events-none">
            {/* Left Satellite: RESTART */}
            <div className="w-12 sm:w-14 flex justify-end shrink-0 pointer-events-auto">
              {isPlaying && handleRestart && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRestart()
                  }}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center shadow-lg backdrop-blur-sm animate-in fade-in zoom-in duration-300"
                  title="Restart Session"
                  aria-label="Restart Session"
                >
                  <RefreshCcw size={20} className="sm:w-6 sm:h-6" />
                </button>
              )}
            </div>

            {/* Hero Player - Centered */}
            <div className="relative flex items-center justify-center shrink-0 pointer-events-auto">
              <div
                aria-hidden="true"
                className={cn(
                  'absolute inset-0 z-0 rounded-full border border-accent-purple/10 shadow-[0_0_0_20px_rgba(125,122,255,0.24),0_0_50px_26px_rgba(125,122,255,0.34)] transition-opacity duration-700',
                  isPlaying ? 'opacity-60' : 'opacity-95'
                )}
              />
              {/* Simon Ring (Cypher Mode) - Outer Edge */}
              {mode === 'cypher' && isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full scale-[1.05] sm:scale-[1.05]" // Slightly larger to be the true border
                    overflow="visible" // Prevent glow clipping
                    style={{
                      transform: 'rotate(-90deg)', // Align 0 to Top
                    }}
                  >
                    {Array.from({ length: cypherPlayers }).map((_, i) => {
                      const pNum = i + 1
                      const isActive = Number(activePlayer) === pNum

                      // Logic for Rotations based on player count
                      let rotation = 0
                      if (cypherPlayers === 2) {
                        // P1: Left (180), P2: Right (0)
                        rotation = i === 0 ? 180 : 0
                      } else if (cypherPlayers === 3) {
                        // P1: TL (240), P2: TR (0), P3: Bottom (120)
                        rotation = i === 0 ? 240 : i === 1 ? 0 : 120
                      } else {
                        // 4 Players: P1: NW (270), P2: NE (0), P3: SE (90), P4: SW (180)
                        rotation = i === 0 ? 270 : (i - 1) * 90
                      }

                      // Color mapping
                      let color = '#0A84FF'
                      switch (pNum) {
                        case 1:
                          color = '#A855F7' // Purple
                          break
                        case 2:
                          color = '#F97316' // Orange
                          break
                        case 3:
                          color = '#FFD60A' // Gold
                          break
                        case 4:
                          color = '#30D158' // Green
                          break
                      }

                      const C = 2 * Math.PI * 49 // Circumference (r=49 to hug edge)
                      const gap = 2 // thinner gap for border look
                      const segmentAngle = 360 / cypherPlayers
                      const segmentLength = (segmentAngle / 360) * C - gap

                      return (
                        <motion.circle
                          key={i}
                          cx="50"
                          cy="50"
                          r="49"
                          fill="none"
                          stroke={color}
                          strokeLinecap="round"
                          strokeDasharray={`${segmentLength} ${C - segmentLength}`}
                          initial={{ opacity: 0.3, strokeWidth: 1 }}
                          animate={{
                            opacity: isActive ? 1 : 0.4,
                            strokeWidth: isActive ? 3 : 1.5, // slightly restored thickness for glow surface
                            filter: isActive
                              ? `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color})` // Double shadow for intense neon
                              : 'none',
                          }}
                          style={{
                            transformOrigin: '50px 50px',
                            transform: `rotate(${rotation}deg)`,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      )
                    })}
                  </svg>
                </div>
              )}

              {/* Pulsing Concentric Rings - Standard Mode Only */}
              {mode !== 'cypher' && isPlaying && (
                <>
                  <motion.div
                    className="absolute rounded-full border-2 pointer-events-none"
                    style={{
                      width: 'calc(min(60vmin, 260px, 45vh) + 40px)', // Updated scaling
                      height: 'calc(min(60vmin, 260px, 45vh) + 40px)',
                      borderColor: 'rgba(74, 72, 176, 0.4)',
                      boxShadow: '0 0 20px rgba(74, 72, 176, 0.2)',
                    }}
                    animate={{
                      scale: [1, 1.08, 1],
                      opacity: [0.6, 0.3, 0.6],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute rounded-full border-2 pointer-events-none"
                    style={{
                      width: 'calc(min(60vmin, 260px, 45vh) + 80px)', // Updated scaling
                      height: 'calc(min(60vmin, 260px, 45vh) + 80px)',
                      borderColor: 'rgba(61, 59, 142, 0.3)',
                      boxShadow: '0 0 30px rgba(61, 59, 142, 0.15)',
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.4, 0.15, 0.4],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.2,
                    }}
                  />
                </>
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
                  'relative z-10 flex items-center justify-center rounded-full transition-all duration-500 group outline-none shrink-0',
                  // Responsive size: Big Red Button with Safety Constraints
                  // Caps width and height to 45% of viewport height to prevent crop on short screens
                  'w-[min(65vmin,320px,45vh)] h-[min(65vmin,320px,45vh)] sm:w-[340px] sm:h-[340px] max-w-[calc(100vw-7rem)] max-h-[calc(100vw-7rem)]',
                  'border backdrop-blur-md shadow-2xl overflow-hidden',
                  // HIDE BORDER IN CYPHER MODE (SVG Ring acts as border)
                  mode === 'cypher'
                    ? 'border-transparent'
                    : isPlaying
                      ? isRecording && !isInfiniteMode && isPro
                        ? 'border-red-500/50 bg-black/40 shadow-red-glow'
                        : 'border-accent-purple/30 bg-black/40 shadow-purple-glow'
                      : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'
                )}
              >
                {/* Visualizer Background */}
                <div className="absolute inset-0 z-0 opacity-60 scale-125">
                  <AudioVisualizer isPlaying={isPlaying || isRecording} />
                </div>

                {/* Ambient Siren Glows - Boosted Intensity */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-full blur-[80px] opacity-0 transition-all duration-300',
                    isPlaying && 'opacity-20',
                    isSirenActive &&
                      (sirenPhase === 0
                        ? 'bg-red-600 opacity-80 scale-150' // Boosted from 40/125
                        : 'bg-blue-600 opacity-80 scale-150')
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
                  {/* Cypher Player Label - Centered in Upper Ring */}
                  {mode === 'cypher' && activePlayer !== 0 && (
                    <div className="absolute -top-12 w-full flex justify-center animate-in fade-in slide-in-from-top-2">
                      <span
                        className={cn(
                          'text-lg sm:text-xl font-black tracking-widest uppercase filter drop-shadow-lg transition-colors duration-300',
                          activePlayer === 1 && 'text-accent-purple',
                          activePlayer === 2 && 'text-accent-orange',
                          activePlayer === 3 && 'text-accent-gold',
                          activePlayer === 4 && 'text-accent-green',
                          activePlayer === 5 && 'text-accent-blue'
                        )}
                      >
                        Player {activePlayer}
                      </span>
                    </div>
                  )}

                  {isPlaying ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      {countdownValue ? (
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
                      ) : currentWord ? (
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
                          exit={{
                            opacity: 0,
                            scale: 1.5,
                            filter: 'blur(20px)',
                          }}
                          transition={{
                            type: 'tween',
                            duration: 0.4,
                            ease: 'easeOut',
                          }}
                          className="flex flex-col items-center justify-center w-full max-w-[85%] px-2"
                        >
                          <h1
                            data-testid="practice-word"
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
                              Math.max(
                                0,
                                sessionDuration -
                                  (currentTime - (startTime || 0))
                              )
                            )}
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
                                isRecording && !isInfiniteMode && isPro
                                  ? 'text-red-400'
                                  : 'text-accent-purple'
                              )}
                            >
                              {isInfiniteMode
                                ? 'Free Flow'
                                : isRecording && isPro
                                  ? 'Recording'
                                  : 'Practice'}
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
                                  (isPro
                                    ? RECORDING_CONFIG.PRO_TIER_LIMIT_SECONDS
                                    : RECORDING_CONFIG.FREE_TIER_LIMIT_SECONDS) -
                                    (recordingDuration || 0)
                                )
                              )
                            ) : (
                              formatTime(
                                Math.max(
                                  0,
                                  sessionDuration -
                                    (currentTime - (startTime || 0))
                                )
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
                        {loadingText}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      {/* START Text - Primary CTA */}
                      <motion.span
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.9, 1, 0.9],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/70 drop-shadow-[0_0_18px_rgba(255,255,255,0.22)] uppercase"
                      >
                        START
                      </motion.span>
                      {/* Mic Indicator - Secondary */}
                      <div className="flex items-center gap-2 text-white/50">
                        <Mic size={18} strokeWidth={1.5} />
                        <span className="text-xs font-medium uppercase tracking-widest">
                          Tap to begin
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.button>
            </div>

            {/* Right Satellite: PAUSE */}
            <div className="w-12 sm:w-14 flex justify-start shrink-0 pointer-events-auto">
              {isPlaying && onTogglePause && !countdownValue && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isPaused) {
                      onTogglePause()
                      setShowPauseModal(true)
                    }
                  }}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center shadow-lg backdrop-blur-sm animate-in fade-in zoom-in duration-300"
                  title="Pause Session"
                  aria-label="Pause Session"
                >
                  <Pause
                    size={20}
                    fill="currentColor"
                    className="opacity-80 sm:w-6 sm:h-6"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record Notifier / Bottom Control Area */}
      <div className="flex-none flex items-end justify-center shrink-0 z-30 pt-2 pb-4 overflow-visible">
        <button
          onClick={(e) => {
            e.stopPropagation()

            // Prevent toggling during active session
            if (isPlaying || isRecording) {
              return
            }

            if (isPro) {
              // Pro: Toggle Mode
              props.onToggleRecordingMode?.()
            } else {
              // Non-Pro: Upsell
              handleUpgrade?.()
            }
          }}
          className={cn(
            'flex items-center justify-center outline-none transition-transform hover:scale-105 active:scale-95 relative focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full',
            !isRecordingEnabled && 'grayscale opacity-60'
          )}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          <div
            className={cn(
              'flex items-center gap-3 rounded-full border px-5 py-3 shadow-lg backdrop-blur-md transition-colors',
              isPro && isRecordingEnabled
                ? 'border-red-500/30 bg-red-500/10 text-white'
                : 'border-white/10 bg-white/5 text-text-tertiary'
            )}
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-black/30">
              <div
                className={cn(
                  'h-3.5 w-3.5 rounded-full transition-colors',
                  isPro && isRecordingEnabled ? 'bg-red-500' : 'bg-gray-600',
                  isRecording && isPro
                    ? 'animate-pulse shadow-[0_0_20px_rgba(255,0,0,0.8)]'
                    : ''
                )}
              />
            </div>
            <span
              className={cn(
                'text-sm font-bold uppercase tracking-[0.18em] transition-colors',
                isPro ? 'text-white' : 'text-white/45'
              )}
            >
              Record
            </span>
          </div>
        </button>
      </div>
    </Card>
  )
}

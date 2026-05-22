import { useState } from 'react'
import { Card } from '@/components/atoms/Card'
import { RefreshCcw, Pause, Mic, Infinity as InfinityIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
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
import {
  CYPHER_PLAYER_THEMES,
  getCypherPlayerTheme,
  RECORDING_CONFIG,
} from '@/lib/constants/design'
import { getVoiceStatusNotice } from '@/lib/tts/voice-status-copy'
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
  const shouldReduceMotion = useReducedMotion()
  const voiceStatusNotice = getVoiceStatusNotice({
    isTTSEnabled,
    spokenPromptNotice,
    voiceStatus,
  })
  const activePlayerTheme = getCypherPlayerTheme(activePlayer)
  const stageAccentColor =
    mode === 'cypher' ? activePlayerTheme.color : '#7D7AFF'
  const stageAccentGlow =
    mode === 'cypher' ? activePlayerTheme.glow : 'rgba(125, 122, 255, 0.3)'
  const stageAccentWash =
    mode === 'cypher' ? activePlayerTheme.wash : 'rgba(125, 122, 255, 0.12)'
  const isCypherStage = mode === 'cypher'

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
        'transition-opacity duration-500 bg-transparent border-none grid grid-rows-[auto_minmax(0,1fr)_auto] flex-1 min-h-0',
        'py-3 sm:py-4 relative overflow-visible'
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
      <div className="flex min-h-0 w-full flex-col items-center justify-center relative z-20 overflow-visible">
        <div className="flex w-full max-w-lg flex-col items-center">
          <PracticeErrorBanner error={error} onRetrySave={onRetrySave} />

          {voiceStatusNotice && !error && (
            <div
              className={cn(
                'mb-4 flex flex-col items-center gap-1 text-xs text-center px-4 py-2 rounded-lg border pointer-events-auto z-50 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300',
                voiceStatusNotice.tone === 'warning'
                  ? 'text-accent-yellow bg-accent-yellow/10 border-accent-yellow/20'
                  : 'text-accent-blue bg-accent-blue/10 border-accent-blue/20'
              )}
              role="status"
              aria-live="polite"
            >
              <span className="font-bold tracking-wider uppercase">
                {voiceStatusNotice.title}
              </span>
              <span className="opacity-90 leading-tight">
                {voiceStatusNotice.message}
              </span>
            </div>
          )}

          <div className="practice-stage-rails grid w-full grid-cols-[3.5rem_minmax(0,1fr)_3.5rem] items-center justify-center gap-2 px-1 relative z-10 pointer-events-none sm:grid-cols-[4rem_minmax(0,1fr)_4rem] sm:gap-3">
            {/* Left Satellite: RESTART */}
            <div className="w-12 sm:w-14 flex justify-end shrink-0 pointer-events-auto">
              {isPlaying && handleRestart && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRestart()
                  }}
                  className="practice-satellite-button w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center shadow-lg backdrop-blur-sm animate-in fade-in zoom-in duration-300"
                  title="Restart Session"
                  aria-label="Restart Session"
                >
                  <RefreshCcw size={20} className="sm:w-6 sm:h-6" />
                </button>
              )}
            </div>

            {/* Hero Player - Centered */}
            <div
              data-testid="practice-orb-frame"
              data-cypher-player={mode === 'cypher' ? activePlayer : undefined}
              data-cypher-player-color={
                mode === 'cypher' ? activePlayerTheme.color : undefined
              }
              className="practice-orb-frame relative flex items-center justify-center shrink-0 pointer-events-auto"
            >
              <div
                aria-hidden="true"
                className={cn(
                  'absolute inset-0 z-0 rounded-full border transition-opacity duration-700',
                  isPlaying ? 'opacity-55' : 'opacity-75'
                )}
                style={{
                  borderColor:
                    mode === 'cypher'
                      ? activePlayerTheme.glow
                      : 'rgba(125, 122, 255, 0.1)',
                  boxShadow: `0 0 0 14px ${stageAccentWash}, 0 0 34px 18px ${stageAccentGlow}`,
                }}
              />
              {/* Simon Ring (Cypher Mode) - Outer Edge */}
              {isCypherStage && (
                <div
                  data-testid="cypher-ring"
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 rounded-full"
                >
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full scale-[1.055]"
                    overflow="visible"
                    style={{
                      transform: 'rotate(-90deg)',
                    }}
                  >
                    {Array.from({ length: cypherPlayers }).map((_, i) => {
                      const pNum = i + 1
                      const isActive = Number(activePlayer) === pNum
                      const theme =
                        CYPHER_PLAYER_THEMES[
                          pNum as keyof typeof CYPHER_PLAYER_THEMES
                        ] ?? CYPHER_PLAYER_THEMES[1]
                      const C = 2 * Math.PI * 48
                      const gap = 4
                      const segmentLength = C / cypherPlayers - gap
                      const dashOffset = -(i * (C / cypherPlayers))

                      return (
                        <motion.circle
                          key={i}
                          data-testid="cypher-ring-segment"
                          data-player={pNum}
                          cx="50"
                          cy="50"
                          r="48"
                          fill="none"
                          stroke={theme.color}
                          strokeLinecap="round"
                          strokeDasharray={`${segmentLength} ${C - segmentLength}`}
                          strokeDashoffset={dashOffset}
                          initial={{ opacity: 0.35, strokeWidth: 2 }}
                          animate={{
                            opacity: isActive ? 1 : 0.5,
                            strokeWidth: isActive ? 4.75 : 2.25,
                            filter: isActive
                              ? `drop-shadow(0 0 6px ${theme.color}) drop-shadow(0 0 14px ${theme.color})`
                              : 'none',
                          }}
                          style={{
                            transformOrigin: '50px 50px',
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
                      width: 'calc(var(--practice-orb-size) + 1.25rem)',
                      height: 'calc(var(--practice-orb-size) + 1.25rem)',
                      borderColor: 'rgba(74, 72, 176, 0.4)',
                      boxShadow: '0 0 20px rgba(74, 72, 176, 0.2)',
                    }}
                    animate={
                      shouldReduceMotion
                        ? { scale: 1, opacity: 0.35 }
                        : {
                            scale: [1, 1.08, 1],
                            opacity: [0.6, 0.3, 0.6],
                          }
                    }
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute rounded-full border-2 pointer-events-none"
                    style={{
                      width: 'calc(var(--practice-orb-size) + 2.75rem)',
                      height: 'calc(var(--practice-orb-size) + 2.75rem)',
                      borderColor: 'rgba(61, 59, 142, 0.3)',
                      boxShadow: '0 0 30px rgba(61, 59, 142, 0.15)',
                    }}
                    animate={
                      shouldReduceMotion
                        ? { scale: 1, opacity: 0.2 }
                        : {
                            scale: [1, 1.1, 1],
                            opacity: [0.4, 0.15, 0.4],
                          }
                    }
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
                whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                animate={
                  shouldReduceMotion
                    ? { scale: 1 }
                    : isPlaying
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
                  'relative z-10 flex aspect-square items-center justify-center rounded-full transition-all duration-500 group outline-none shrink-0',
                  'h-full w-full',
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
                <div
                  data-testid="practice-visualizer"
                  data-visualizer-color={stageAccentColor}
                  className="absolute inset-0 z-0 opacity-60 scale-125"
                >
                  <AudioVisualizer
                    isPlaying={isPlaying || isRecording}
                    color={stageAccentColor}
                  />
                </div>

                {/* Ambient Siren Glows - Boosted Intensity */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-full blur-[54px] opacity-0 transition-all duration-300',
                    isPlaying && 'opacity-20',
                    isSirenActive &&
                      (sirenPhase === 0
                        ? 'bg-red-600 opacity-65 scale-125'
                        : 'bg-blue-600 opacity-65 scale-125')
                  )}
                />

                {/* Ambient Background Glow (Original) */}
                <div
                  data-testid="practice-player-glow"
                  className={cn(
                    'absolute inset-0 rounded-full opacity-0 transition-opacity duration-700',
                    isPlaying && !isSirenActive && 'opacity-100'
                  )}
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${stageAccentWash} 0%, transparent 66%)`,
                  }}
                >
                  <div
                    className="absolute inset-0 blur-3xl"
                    style={{
                      background: `linear-gradient(135deg, ${stageAccentWash}, transparent 64%)`,
                    }}
                  />
                </div>

                {/* Timer Ring */}
                <div
                  data-testid="practice-timer-ring"
                  className="absolute inset-0 p-5 sm:p-6 flex items-center justify-center pointer-events-none"
                >
                  <TimerRing
                    progress={intervalProgress}
                    isSirenActive={isSirenActive}
                    sirenPhase={sirenPhase}
                    size={300}
                    className={cn(
                      'w-full h-full text-white/5 transition-colors duration-500',
                      isPlaying && !isSirenActive && 'drop-shadow-neon'
                    )}
                    progressColor={stageAccentColor}
                    strokeWidth={6}
                  />
                </div>

                {/* Inner Content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                  {/* Cypher Player Label - Centered in Upper Ring */}
                  {mode === 'cypher' && activePlayer !== 0 && (
                    <div className="practice-cypher-label absolute -top-12 w-full flex justify-center animate-in fade-in slide-in-from-top-2">
                      <span
                        className={cn(
                          'text-lg sm:text-xl font-black tracking-widest uppercase filter drop-shadow-lg transition-colors duration-300',
                          activePlayerTheme.className
                        )}
                      >
                        {activePlayerTheme.label}
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
                            rotate: shouldReduceMotion ? 0 : [-1, 1, -1, 0],
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
                              'practice-word-text font-black text-transparent bg-clip-text tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] break-words text-balance uppercase leading-none transition-all duration-300',
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
                          <span className="practice-session-timer text-3xl font-medium text-white/60 tabular-nums mt-4 drop-shadow-md">
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
                        animate={
                          shouldReduceMotion
                            ? { scale: 1, opacity: 1 }
                            : {
                                scale: [1, 1.05, 1],
                                opacity: [0.9, 1, 0.9],
                              }
                        }
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
                  className="practice-satellite-button w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center shadow-lg backdrop-blur-sm animate-in fade-in zoom-in duration-300"
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
      <div className="practice-record-area flex-none flex items-end justify-center shrink-0 z-30 pt-2 pb-3 overflow-visible">
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
          aria-label={
            isPlaying || isRecording
              ? 'Recording mode is locked during an active session'
              : isPro
                ? isRecordingEnabled
                  ? 'Disable recording mode'
                  : 'Enable recording mode'
                : 'Upgrade to enable recording mode'
          }
        >
          <div
            className={cn(
              'practice-record-pill flex items-center gap-3 rounded-full border px-5 py-3 shadow-lg backdrop-blur-md transition-colors',
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

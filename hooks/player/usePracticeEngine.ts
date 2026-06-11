import { useEffect, useCallback, useRef, useState } from 'react'
import { usePlayerState } from './usePlayerState'
import { useAudioSync } from './useAudioSync'
import { useBeatPlayer } from '@/hooks/useBeatPlayer'
import { useRecording } from '@/hooks/useRecording'
import { usePracticeSession } from '@/contexts/SessionContext'
import { useTTS } from '@/hooks/useTTS'
import { Beat } from '@/types/database'
import { countSyllables, getDifficultyFromSyllables } from '@/lib/words/utils'
import { getActiveCalibrationMs } from '@/lib/audio/calibration'
import { getFallbackWords } from '@/lib/data/fallbacks'
import { DEFAULT_TTS_LANGUAGE } from '@/lib/tts/languages'
import type { PracticeWordSeed } from '@/lib/words/practice-word-seed'
import { buildSessionWordQueue } from '@/lib/words/session-queue'
import { getEffectiveTTSEnabled } from '@/lib/tts/platform'
import { trackReliabilityEvent } from '@/lib/telemetry/reliability'

const ACTIVE_SESSION_STATUSES = new Set([
  'COUNTDOWN',
  'PLAYING',
  'PAUSED',
  'FINISHING',
  'MIXING',
  'SAVING',
])

const STATIC_FALLBACK_WORDS = [
  'Flow',
  'Rhythm',
  'Power',
  'Spirit',
  'Vision',
  'Create',
  'Inspire',
  'Energy',
  'Focus',
  'Elevate',
  'Master',
  'Legend',
  'Hustle',
  'Grind',
]

function normalizeWordKey(word: string): string {
  return word.trim().toLowerCase()
}

function getFallbackWordSeeds(language: string): PracticeWordSeed[] {
  const localized = getFallbackWords(language)
  if (localized.length > 0) {
    return localized.map((word) => ({
      wordText: word.wordText,
      difficultyLevel: word.difficultyLevel,
      syllableCount: word.syllableCount,
    }))
  }

  const defaultPool = getFallbackWords(DEFAULT_TTS_LANGUAGE)
  if (defaultPool.length > 0) {
    return defaultPool.map((word) => ({
      wordText: word.wordText,
      difficultyLevel: word.difficultyLevel,
      syllableCount: word.syllableCount,
    }))
  }

  return STATIC_FALLBACK_WORDS.map((wordText) => ({
    wordText,
    difficultyLevel: undefined,
    syllableCount: undefined,
  }))
}

function normalizeWordSeeds(words: PracticeWordSeed[]): PracticeWordSeed[] {
  const seen = new Set<string>()
  const normalized: PracticeWordSeed[] = []

  for (const seed of words) {
    const wordText = seed.wordText?.trim()
    if (!wordText) continue

    const key = normalizeWordKey(wordText)
    if (seen.has(key)) continue
    seen.add(key)

    const syllableCount =
      typeof seed.syllableCount === 'number' && seed.syllableCount > 0
        ? seed.syllableCount
        : countSyllables(wordText)
    const rawDifficulty =
      typeof seed.difficultyLevel === 'number' && seed.difficultyLevel > 0
        ? seed.difficultyLevel
        : getDifficultyFromSyllables(syllableCount)

    normalized.push({
      wordText,
      syllableCount,
      difficultyLevel: Math.min(3, Math.max(1, rawDifficulty)),
    })
  }

  return normalized
}

function mergeWordPools(...pools: PracticeWordSeed[][]): PracticeWordSeed[] {
  return normalizeWordSeeds(pools.flat())
}

interface UsePracticeEngineProps {
  initialBeats: Beat[]
  initialWords: PracticeWordSeed[]
  frequency: number
  difficulty: number
  submitSession: (formData: FormData) => Promise<unknown>
  mode?: 'solo' | 'cypher'
  cypherPlayers?: number
  isRecordingEnabled?: boolean
  shouldSaveSessions?: boolean
  sessionDurationSeconds?: number
  disableSpokenTTS?: boolean
}

export function usePracticeEngine({
  initialBeats,
  initialWords,
  frequency,
  difficulty,
  submitSession,
  mode = 'solo',
  cypherPlayers = 4,
  isRecordingEnabled = false,
  shouldSaveSessions = true,
  sessionDurationSeconds = 600,
  disableSpokenTTS = false,
}: UsePracticeEngineProps) {
  const isAudioDebug =
    process.env.NODE_ENV !== 'production' &&
    process.env.NEXT_PUBLIC_AUDIO_DEBUG === 'true'

  const debugLog = useCallback(
    (...args: unknown[]) => {
      if (isAudioDebug) {
        console.log(...args)
      }
    },
    [isAudioDebug]
  )

  const { state, dispatch } = usePlayerState()
  const [audioSyncSessionId, setAudioSyncSessionId] = useState(0)
  const beatPlayer = useBeatPlayer()
  const recorder = useRecording()
  const latestStatusRef = useRef(state.status)
  const beatPlayerRef = useRef(beatPlayer)
  const recorderRef = useRef(recorder)
  const beatOffsetMsRef = useRef(0)
  const startTimeRef = useRef(0)
  const wordPoolRef = useRef<PracticeWordSeed[]>([])
  const sessionQueueRef = useRef<PracticeWordSeed[]>([])
  const sessionQueueIndexRef = useRef(0)
  const isTopUpInFlightRef = useRef(false)
  const fallbackWordPoolRef = useRef<string[]>([])
  const sessionTelemetryRef = useRef({
    queueTopUpRequested: false,
    queueFallbackRequired: false,
    textOnlyModeLogged: false,
    emptyRecordingLogged: false,
  })
  const {
    isTTSEnabled,
    ttsVolume,
    beatVolume,
    selectedLanguage,
    isStudioFXEnabled,
    startSession: markSessionActive,
    stopSession: markSessionInactive,
  } = usePracticeSession()

  useEffect(() => {
    latestStatusRef.current = state.status
  }, [state.status])

  useEffect(() => {
    beatPlayerRef.current = beatPlayer
  }, [beatPlayer])

  useEffect(() => {
    recorderRef.current = recorder
  }, [recorder])

  useEffect(() => {
    return () => {
      markSessionInactive()

      const status = latestStatusRef.current
      if (status !== 'IDLE' && status !== 'COMPLETED') {
        beatPlayerRef.current.stop()
        if (recorderRef.current.isRecording) {
          recorderRef.current.stop()
        }
      }
    }
  }, [markSessionInactive])

  const [currentWord, setCurrentWord] = useState('')
  const [activePlayer, setActivePlayer] = useState(1)
  const [startTime, setStartTime] = useState(0)
  const pauseStartedAtRef = useRef<number | null>(null)
  const [wordTiming, setWordTiming] = useState<{
    start: number
    duration: number
  }>({ start: 0, duration: 0 })
  const wordsUsedRef = useRef<string[]>([])
  const [activeDifficulty, setActiveDifficulty] = useState(difficulty)
  const activeDifficultyRef = useRef(difficulty)
  const pendingDifficultyRef = useRef<number | null>(null)
  const [activeFrequency, setActiveFrequency] = useState(frequency)
  const activeFrequencyRef = useRef(frequency)
  const pendingFrequencyRef = useRef<number | null>(null)
  const lastSavePayloadRef = useRef<FormData | null>(null)

  const effectiveTTSEnabled = getEffectiveTTSEnabled(
    isTTSEnabled,
    disableSpokenTTS
  )

  const getSessionBpm = useCallback(() => {
    return beatPlayer.currentBeat?.bpm || initialBeats[0]?.bpm || 90
  }, [beatPlayer.currentBeat?.bpm, initialBeats])

  const getFallbackWord = useCallback((usedWords: string[] = []) => {
    const usedKeys = new Set(usedWords.map(normalizeWordKey))
    const unusedFallback = fallbackWordPoolRef.current.find(
      (word) => !usedKeys.has(normalizeWordKey(word))
    )

    return (
      unusedFallback ||
      fallbackWordPoolRef.current[0] ||
      STATIC_FALLBACK_WORDS[0]
    )
  }, [])

  const buildQueueFromPool = useCallback(
    ({
      nextDifficulty,
      nextFrequency,
      remainingDurationSeconds,
      usedWords,
    }: {
      nextDifficulty: number
      nextFrequency: number
      remainingDurationSeconds: number
      usedWords: string[]
    }) => {
      const fallbackSeeds = normalizeWordSeeds(
        getFallbackWordSeeds(selectedLanguage)
      )
      wordPoolRef.current = mergeWordPools(wordPoolRef.current, fallbackSeeds)
      fallbackWordPoolRef.current = fallbackSeeds.map((seed) => seed.wordText)

      const result = buildSessionWordQueue({
        bpm: getSessionBpm(),
        frequency: nextFrequency,
        difficulty: nextDifficulty,
        language: selectedLanguage,
        sessionDurationSeconds: Math.max(1, remainingDurationSeconds),
        words: wordPoolRef.current,
        usedWords,
      })

      sessionQueueRef.current = result.queue
      sessionQueueIndexRef.current = 0
      return result
    },
    [getSessionBpm, selectedLanguage]
  )

  const fetchWordTopUps = useCallback(
    async (count: number, excludeWordTexts: string[]) => {
      if (count <= 0) return []

      const params = new URLSearchParams()
      params.set('count', String(Math.min(Math.max(count, 12), 240)))
      params.set('language', selectedLanguage)
      excludeWordTexts.forEach((word) => params.append('exclude', word))

      try {
        const res = await fetch(`/api/words/random?${params.toString()}`, {
          cache: 'no-store',
        })
        if (!res.ok) {
          throw new Error(`Word top-up failed (${res.status})`)
        }

        const data = (await res.json()) as {
          words?: PracticeWordSeed[]
        }

        return normalizeWordSeeds(Array.isArray(data.words) ? data.words : [])
      } catch (error) {
        console.warn('[PracticeEngine] Failed to top up word queue:', error)
        return []
      }
    },
    [selectedLanguage]
  )

  const ensurePreparedQueue = useCallback(
    async ({
      nextDifficulty,
      nextFrequency,
      remainingDurationSeconds,
      usedWords,
    }: {
      nextDifficulty: number
      nextFrequency: number
      remainingDurationSeconds: number
      usedWords: string[]
    }) => {
      let result = buildQueueFromPool({
        nextDifficulty,
        nextFrequency,
        remainingDurationSeconds,
        usedWords,
      })

      if (result.deficit > 0 && !isTopUpInFlightRef.current) {
        if (!sessionTelemetryRef.current.queueTopUpRequested) {
          sessionTelemetryRef.current.queueTopUpRequested = true
          trackReliabilityEvent('practice_prompt_queue_top_up_requested', {
            language: selectedLanguage,
            difficulty: nextDifficulty,
            frequency: nextFrequency,
            budget: result.budget,
            deficit: result.deficit,
            usedWordsCount: usedWords.length,
            poolSize: wordPoolRef.current.length,
          })
        }

        isTopUpInFlightRef.current = true
        try {
          const topUps = await fetchWordTopUps(result.deficit + 24, [
            ...usedWords,
            ...wordPoolRef.current.map((seed) => seed.wordText),
          ])

          if (topUps.length > 0) {
            trackReliabilityEvent('practice_prompt_queue_top_up_received', {
              language: selectedLanguage,
              requestedCount: result.deficit + 24,
              receivedCount: topUps.length,
            })
            wordPoolRef.current = mergeWordPools(wordPoolRef.current, topUps)
            result = buildQueueFromPool({
              nextDifficulty,
              nextFrequency,
              remainingDurationSeconds,
              usedWords,
            })
          }
        } finally {
          isTopUpInFlightRef.current = false
        }
      }

      if (result.deficit > 0) {
        if (!sessionTelemetryRef.current.queueFallbackRequired) {
          sessionTelemetryRef.current.queueFallbackRequired = true
          trackReliabilityEvent(
            'practice_prompt_queue_fallback_required',
            {
              language: selectedLanguage,
              difficulty: nextDifficulty,
              frequency: nextFrequency,
              budget: result.budget,
              remainingDeficit: result.deficit,
            },
            'warning'
          )
        }

        wordPoolRef.current = mergeWordPools(
          wordPoolRef.current,
          getFallbackWordSeeds(selectedLanguage)
        )
        result = buildQueueFromPool({
          nextDifficulty,
          nextFrequency,
          remainingDurationSeconds,
          usedWords,
        })
      }

      return result
    },
    [buildQueueFromPool, fetchWordTopUps, selectedLanguage]
  )

  const takeNextQueuedWord = useCallback(
    ({
      nextDifficulty,
      nextFrequency,
      remainingDurationSeconds,
    }: {
      nextDifficulty: number
      nextFrequency: number
      remainingDurationSeconds: number
    }) => {
      if (sessionQueueIndexRef.current >= sessionQueueRef.current.length) {
        buildQueueFromPool({
          nextDifficulty,
          nextFrequency,
          remainingDurationSeconds,
          usedWords: wordsUsedRef.current,
        })
      }

      const nextSeed = sessionQueueRef.current[sessionQueueIndexRef.current]
      if (!nextSeed) return null

      sessionQueueIndexRef.current += 1
      return nextSeed
    },
    [buildQueueFromPool]
  )

  useEffect(() => {
    const normalizedInitialWords = normalizeWordSeeds(initialWords)
    const fallbackSeeds = normalizeWordSeeds(
      getFallbackWordSeeds(selectedLanguage)
    )

    wordPoolRef.current = mergeWordPools(normalizedInitialWords, fallbackSeeds)
    fallbackWordPoolRef.current = fallbackSeeds.map((seed) => seed.wordText)

    const previewQueue = buildQueueFromPool({
      nextDifficulty:
        pendingDifficultyRef.current ?? activeDifficultyRef.current,
      nextFrequency: pendingFrequencyRef.current ?? activeFrequencyRef.current,
      remainingDurationSeconds: sessionDurationSeconds,
      usedWords: [],
    })

    const previewWord =
      previewQueue.queue[0]?.wordText || getFallbackWord(wordsUsedRef.current)
    setCurrentWord(previewWord)
  }, [
    initialWords,
    selectedLanguage,
    sessionDurationSeconds,
    buildQueueFromPool,
    getFallbackWord,
  ])

  useEffect(() => {
    if (difficulty === activeDifficultyRef.current) {
      return
    }

    if (ACTIVE_SESSION_STATUSES.has(state.status)) {
      pendingDifficultyRef.current = difficulty
      return
    }

    pendingDifficultyRef.current = null
    activeDifficultyRef.current = difficulty
    setActiveDifficulty(difficulty)

    const previewQueue = buildQueueFromPool({
      nextDifficulty: difficulty,
      nextFrequency: activeFrequencyRef.current,
      remainingDurationSeconds: sessionDurationSeconds,
      usedWords: [],
    })
    const previewWord =
      previewQueue.queue[0]?.wordText || getFallbackWord(wordsUsedRef.current)
    setCurrentWord(previewWord)
  }, [
    difficulty,
    state.status,
    buildQueueFromPool,
    getFallbackWord,
    sessionDurationSeconds,
  ])

  useEffect(() => {
    if (frequency === activeFrequencyRef.current) {
      return
    }

    if (ACTIVE_SESSION_STATUSES.has(state.status)) {
      pendingFrequencyRef.current = frequency
      return
    }

    pendingFrequencyRef.current = null
    activeFrequencyRef.current = frequency
    setActiveFrequency(frequency)

    const previewQueue = buildQueueFromPool({
      nextDifficulty: activeDifficultyRef.current,
      nextFrequency: frequency,
      remainingDurationSeconds: sessionDurationSeconds,
      usedWords: [],
    })
    const previewWord =
      previewQueue.queue[0]?.wordText || getFallbackWord(wordsUsedRef.current)
    setCurrentWord(previewWord)
  }, [
    frequency,
    state.status,
    buildQueueFromPool,
    getFallbackWord,
    sessionDurationSeconds,
  ])

  const { speak, warmup, cancel, voiceStatus } = useTTS({
    enabled: effectiveTTSEnabled,
    language: selectedLanguage,
    volume: ttsVolume,
    rate: 1.0,
    pitch: 1.0,
  })

  useEffect(() => {
    if (!effectiveTTSEnabled || !currentWord || state.status !== 'PLAYING') {
      return
    }

    speak(currentWord)
    return () => cancel()
  }, [cancel, currentWord, speak, state.status, effectiveTTSEnabled])

  const trackWordUsage = useCallback((word: string) => {
    const trimmed = word.trim()
    if (!trimmed) return

    const wordKey = normalizeWordKey(trimmed)
    const alreadyTracked = wordsUsedRef.current.some(
      (usedWord) => normalizeWordKey(usedWord) === wordKey
    )
    if (!alreadyTracked) {
      wordsUsedRef.current.push(trimmed)
    }
  }, [])

  const onBeat = useCallback(
    (beatIndex: number, time: number) => {
      const beatsPerWord = 4 * (activeFrequencyRef.current || 4)
      if (beatIndex % beatsPerWord !== 0) {
        return
      }

      let nextDifficulty = activeDifficultyRef.current
      let nextFrequency = activeFrequencyRef.current || 4
      let shouldRebuildQueue = false

      if (
        pendingDifficultyRef.current !== null &&
        pendingDifficultyRef.current !== activeDifficultyRef.current
      ) {
        nextDifficulty = pendingDifficultyRef.current
        pendingDifficultyRef.current = null
        activeDifficultyRef.current = nextDifficulty
        setActiveDifficulty(nextDifficulty)
        shouldRebuildQueue = true
      }

      if (
        pendingFrequencyRef.current !== null &&
        pendingFrequencyRef.current !== activeFrequencyRef.current
      ) {
        nextFrequency = pendingFrequencyRef.current
        pendingFrequencyRef.current = null
        activeFrequencyRef.current = nextFrequency
        setActiveFrequency(nextFrequency)
        shouldRebuildQueue = true
      }

      const duration =
        4 *
        nextFrequency *
        (60 / (beatPlayer.currentBeat?.bpm || getSessionBpm()))
      const elapsed = Math.max(0, time - startTimeRef.current)
      const remainingDurationSeconds = Math.max(
        1,
        sessionDurationSeconds - elapsed
      )

      if (shouldRebuildQueue) {
        buildQueueFromPool({
          nextDifficulty,
          nextFrequency,
          remainingDurationSeconds,
          usedWords: wordsUsedRef.current,
        })
      }

      const nextSeed = takeNextQueuedWord({
        nextDifficulty,
        nextFrequency,
        remainingDurationSeconds,
      })
      const nextWord =
        nextSeed?.wordText || getFallbackWord(wordsUsedRef.current)

      setCurrentWord(nextWord)
      setWordTiming({ start: time, duration })
      trackWordUsage(nextWord)

      if (mode === 'cypher' && beatIndex > 0) {
        setActivePlayer((prev) => (prev % cypherPlayers) + 1)
      }
    },
    [
      beatPlayer.currentBeat?.bpm,
      buildQueueFromPool,
      cypherPlayers,
      getFallbackWord,
      getSessionBpm,
      mode,
      sessionDurationSeconds,
      takeNextQueuedWord,
      trackWordUsage,
    ]
  )

  const audioSync = useAudioSync({
    bpm: beatPlayer.currentBeat?.bpm || getSessionBpm(),
    isPlaying: state.status === 'PLAYING' && beatPlayer.isPlaying,
    sessionId: audioSyncSessionId,
    onBeat,
  })
  const { initAudio, audioState } = audioSync

  useEffect(() => {
    if (ACTIVE_SESSION_STATUSES.has(state.status)) {
      markSessionActive()
    } else {
      markSessionInactive()
    }
  }, [state.status, markSessionActive, markSessionInactive])

  useEffect(() => {
    if (state.status === 'PLAYING' && !beatPlayer.isPlaying) {
      if (pauseStartedAtRef.current === null) {
        pauseStartedAtRef.current = audioSync.getPreciseTime()
      }
      dispatch({ type: 'PAUSE' })
      if (isRecordingEnabled) {
        recorder.pause()
      }
    }
  }, [
    state.status,
    beatPlayer.isPlaying,
    dispatch,
    isRecordingEnabled,
    recorder,
    audioSync,
  ])

  const startSession = useCallback(async () => {
    if (state.status !== 'IDLE' && state.status !== 'COMPLETED') return

    try {
      const sessionDifficulty = pendingDifficultyRef.current ?? difficulty
      const sessionFrequency = pendingFrequencyRef.current ?? frequency

      beatOffsetMsRef.current = 0
      startTimeRef.current = 0
      setAudioSyncSessionId((id) => id + 1)
      pauseStartedAtRef.current = null
      wordsUsedRef.current = []
      sessionTelemetryRef.current = {
        queueTopUpRequested: false,
        queueFallbackRequired: false,
        textOnlyModeLogged: false,
        emptyRecordingLogged: false,
      }
      setActivePlayer(1)
      setWordTiming({ start: 0, duration: 0 })
      setStartTime(0)
      activeDifficultyRef.current = sessionDifficulty
      pendingDifficultyRef.current = null
      setActiveDifficulty(sessionDifficulty)
      activeFrequencyRef.current = sessionFrequency
      pendingFrequencyRef.current = null
      setActiveFrequency(sessionFrequency)

      const preparedQueue = await ensurePreparedQueue({
        nextDifficulty: sessionDifficulty,
        nextFrequency: sessionFrequency,
        remainingDurationSeconds: sessionDurationSeconds,
        usedWords: [],
      })

      const firstWord =
        preparedQueue.queue[0]?.wordText ||
        getFallbackWord(wordsUsedRef.current)
      setCurrentWord(firstWord)

      const ctx = initAudio()

      if (ctx) {
        if (ctx.state === 'suspended') {
          await ctx.resume()
        }

        beatPlayer.connectTo(ctx)
      }

      await beatPlayer.prime()

      if (effectiveTTSEnabled) {
        warmup()
      } else if (
        isTTSEnabled &&
        disableSpokenTTS &&
        !sessionTelemetryRef.current.textOnlyModeLogged
      ) {
        sessionTelemetryRef.current.textOnlyModeLogged = true
        trackReliabilityEvent('practice_tts_text_only_mode', {
          language: selectedLanguage,
          reason: 'ios_ducking_protection',
        })
      }

      beatPlayer.setVolume(beatVolume)

      if (ctx?.state !== 'running') {
        console.warn(
          '[PracticeEngine] AudioContext is not running:',
          ctx?.state
        )
      } else {
        debugLog('[PracticeEngine] AudioContext Verified: RUNNING')
      }

      dispatch({ type: 'START' })
    } catch (err) {
      console.error('[PracticeEngine] Start failed:', err)
      alert('Could not start audio engine. Please tap again.')
    }
  }, [
    state.status,
    difficulty,
    frequency,
    ensurePreparedQueue,
    getFallbackWord,
    initAudio,
    beatPlayer,
    disableSpokenTTS,
    effectiveTTSEnabled,
    warmup,
    isTTSEnabled,
    beatVolume,
    selectedLanguage,
    debugLog,
    dispatch,
    sessionDurationSeconds,
  ])

  const stopSession = useCallback(() => {
    dispatch({ type: 'STOP', shouldSave: shouldSaveSessions })
    beatPlayer.stop()
    if (isRecordingEnabled) {
      recorder.stop()
    }
  }, [dispatch, beatPlayer, recorder, isRecordingEnabled, shouldSaveSessions])

  const discardSession = useCallback(() => {
    if (confirm('Discard this session?')) {
      dispatch({ type: 'DISCARD' })
      beatPlayer.stop()
      if (isRecordingEnabled) {
        recorder.stop()
      }
    }
  }, [dispatch, beatPlayer, recorder, isRecordingEnabled])

  const togglePause = useCallback(async () => {
    if (state.status === 'PLAYING') {
      if (pauseStartedAtRef.current === null) {
        pauseStartedAtRef.current = audioSync.getPreciseTime()
      }
      dispatch({ type: 'PAUSE' })
      beatPlayer.pause()
      if (isRecordingEnabled) {
        recorder.pause()
      }
    } else if (state.status === 'PAUSED') {
      const resumed = await beatPlayer.play()
      if (!resumed) {
        alert('Could not resume playback. Please try again.')
        return
      }

      const pauseStartedAt = pauseStartedAtRef.current
      if (pauseStartedAt !== null) {
        const pausedFor = audioSync.getPreciseTime() - pauseStartedAt
        if (pausedFor > 0) {
          setStartTime((prev) => {
            const next = prev > 0 ? prev + pausedFor : prev
            startTimeRef.current = next
            return next
          })
          setWordTiming((prev) =>
            prev.start > 0 ? { ...prev, start: prev.start + pausedFor } : prev
          )
        }
      }
      pauseStartedAtRef.current = null

      dispatch({ type: 'RESUME' })
      if (isRecordingEnabled) {
        recorder.resume()
      }
    }
  }, [
    state.status,
    dispatch,
    beatPlayer,
    recorder,
    isRecordingEnabled,
    audioSync,
  ])

  const retrySave = useCallback(() => {
    if (
      state.status === 'COMPLETED' &&
      state.error &&
      lastSavePayloadRef.current
    ) {
      dispatch({ type: 'START_SAVE' })
      submitSession(lastSavePayloadRef.current)
        .then(() => dispatch({ type: 'SAVE_SUCCESS' }))
        .catch((err) =>
          dispatch({
            type: 'SAVE_ERROR',
            error: err instanceof Error ? err.message : 'Unknown error',
          })
        )
    }
  }, [state.status, state.error, dispatch, submitSession])

  const completeCountdown = useCallback(async () => {
    beatPlayer.setLoop(true)
    const started = await beatPlayer.play()

    if (!started) {
      beatPlayer.stop()
      dispatch({ type: 'RESET' })
      alert('Could not start playback. Please try again.')
      return
    }

    dispatch({ type: 'COUNTDOWN_COMPLETE' })
    const nextStartTime = audioSync.getPreciseTime()
    startTimeRef.current = nextStartTime
    setStartTime(nextStartTime)
    if (isRecordingEnabled) {
      beatOffsetMsRef.current = 0
      recorder
        .start()
        .then(() => {
          beatOffsetMsRef.current = Math.round(
            beatPlayer.getPreciseTime() * 1000
          )
        })
        .catch((err) => {
          console.error('[PracticeEngine] Recorder start failed:', err)
        })
    }
  }, [dispatch, beatPlayer, recorder, audioSync, isRecordingEnabled])

  useEffect(() => {
    if (state.status === 'FINISHING' && !state.shouldSave) {
      dispatch({ type: 'RESET' })
    }
  }, [state.status, state.shouldSave, dispatch])

  useEffect(() => {
    if (state.status === 'EXITING' && !recorder.isRecording) {
      dispatch({ type: 'RESET' })
    }
  }, [state.status, recorder.isRecording, dispatch])

  const { setOnComplete, setOnMaxDurationReached } = recorder

  useEffect(() => {
    setOnComplete(async (blob, duration) => {
      if (
        (state.status === 'FINISHING' || state.status === 'MIXING') &&
        state.shouldSave
      ) {
        if (blob.size === 0) {
          if (!sessionTelemetryRef.current.emptyRecordingLogged) {
            sessionTelemetryRef.current.emptyRecordingLogged = true
            trackReliabilityEvent(
              'practice_recording_metadata_only_fallback',
              {
                reason: 'empty_blob',
                durationSeconds: Math.max(
                  1,
                  Math.round(audioSync.getPreciseTime() - startTimeRef.current)
                ),
                isRecordingEnabled,
              },
              'warning'
            )
          }

          debugLog(
            '[PracticeEngine] Empty blob detected. Skipping upload, saving metadata only.'
          )
          dispatch({ type: 'START_SAVE' })

          const fd = new FormData()

          if (beatPlayer.currentBeat) {
            fd.append('beatId', beatPlayer.currentBeat.id)
            fd.append(
              'title',
              `${beatPlayer.currentBeat.title} - ${new Date().toLocaleDateString()}`
            )
          }
          const fallbackDuration =
            audioSync.getPreciseTime() - startTimeRef.current
          fd.append(
            'durationSeconds',
            Math.max(1, Math.round(fallbackDuration)).toString()
          )
          fd.append('frequency', frequency.toString())
          fd.append('difficulty', difficulty.toString())
          fd.append('score', '0')
          fd.append('wordsUsed', JSON.stringify(wordsUsedRef.current))

          lastSavePayloadRef.current = fd
          submitSession(fd)
            .then(() => dispatch({ type: 'SAVE_SUCCESS' }))
            .catch((err) =>
              dispatch({
                type: 'SAVE_ERROR',
                error: err instanceof Error ? err.message : 'Unknown error',
              })
            )
          return
        }

        dispatch({ type: 'START_SAVE' })

        try {
          const fd = new FormData()
          fd.append('audio', blob, 'recording.webm')

          if (beatPlayer.currentBeat) {
            fd.append('beatId', beatPlayer.currentBeat.id)
            fd.append(
              'title',
              `${beatPlayer.currentBeat.title} - ${new Date().toLocaleDateString()}`
            )
          }
          fd.append(
            'durationSeconds',
            Math.max(1, Math.round(duration)).toString()
          )
          fd.append('frequency', frequency.toString())
          fd.append('difficulty', difficulty.toString())
          fd.append('score', '0')
          fd.append('vibe', 'Freestyle Flow')
          fd.append('wordsUsed', JSON.stringify(wordsUsedRef.current))

          const latencyMs = getActiveCalibrationMs()

          fd.append('beatOffsetMs', beatOffsetMsRef.current.toString())
          fd.append(
            'fxConfig',
            JSON.stringify({
              version: 1,
              voiceVolume: 1.0,
              beatVolume,
              nudge: latencyMs,
              reverb: isStudioFXEnabled,
            })
          )

          lastSavePayloadRef.current = fd
          submitSession(fd)
            .then(() => dispatch({ type: 'SAVE_SUCCESS' }))
            .catch((err: unknown) =>
              dispatch({
                type: 'SAVE_ERROR',
                error: err instanceof Error ? err.message : 'Unknown error',
              })
            )
        } catch (e: unknown) {
          dispatch({
            type: 'SAVE_ERROR',
            error: e instanceof Error ? e.message : 'Unknown error',
          })
        }
      } else if (state.status === 'EXITING' || !state.shouldSave) {
        dispatch({ type: 'RESET' })
      }
    })

    if (
      state.status === 'FINISHING' &&
      state.shouldSave &&
      !recorder.isRecording &&
      recorder.duration === 0
    ) {
      if (!sessionTelemetryRef.current.emptyRecordingLogged) {
        sessionTelemetryRef.current.emptyRecordingLogged = true
        trackReliabilityEvent(
          'practice_recording_metadata_only_fallback',
          {
            reason: 'no_recording_detected',
            durationSeconds: Math.max(
              1,
              Math.round(audioSync.getPreciseTime() - startTimeRef.current)
            ),
            isRecordingEnabled,
          },
          'warning'
        )
      }

      debugLog(
        '[PracticeEngine] No recording detected. Submitting metadata only.'
      )
      dispatch({ type: 'START_SAVE' })

      const fd = new FormData()

      if (beatPlayer.currentBeat) {
        fd.append('beatId', beatPlayer.currentBeat.id)
        fd.append(
          'title',
          `${beatPlayer.currentBeat.title} - ${new Date().toLocaleDateString()}`
        )
      }
      const duration = audioSync.getPreciseTime() - startTimeRef.current
      fd.append('durationSeconds', Math.max(1, Math.round(duration)).toString())
      fd.append('frequency', frequency.toString())
      fd.append('difficulty', difficulty.toString())
      fd.append('score', '0')
      fd.append('wordsUsed', JSON.stringify(wordsUsedRef.current))

      lastSavePayloadRef.current = fd
      submitSession(fd)
        .then(() => dispatch({ type: 'SAVE_SUCCESS' }))
        .catch((err) =>
          dispatch({
            type: 'SAVE_ERROR',
            error: err instanceof Error ? err.message : 'Unknown error',
          })
        )
    }

    if (isRecordingEnabled) {
      setOnMaxDurationReached(() => {
        stopSession()
      })
    }
  }, [
    state.status,
    state.shouldSave,
    setOnComplete,
    setOnMaxDurationReached,
    submitSession,
    dispatch,
    beatPlayer.currentBeat,
    stopSession,
    difficulty,
    frequency,
    beatVolume,
    isStudioFXEnabled,
    audioSync,
    recorder.duration,
    recorder.isRecording,
    isRecordingEnabled,
    debugLog,
  ])

  useEffect(() => {
    beatPlayer.setVolume(beatVolume)
  }, [beatVolume, beatPlayer])

  return {
    status: state.status,
    isGuest: state.isGuest,
    error: state.error,
    audioState,

    startSession,
    stopSession,
    discardSession,
    togglePause,
    completeCountdown,
    retrySave,

    voiceStatus,
    beatPlayer,
    recorder,

    currentWord,
    wordTiming,
    activePlayer,
    activeDifficulty,
    activeFrequency,

    startTime,
    getAudioTime: audioSync.getPreciseTime,
  }
}

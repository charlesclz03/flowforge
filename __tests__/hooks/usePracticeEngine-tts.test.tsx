import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Beat } from '@/types/database'
import { usePracticeEngine } from '@/hooks/player/usePracticeEngine'

const mocks = vi.hoisted(() => {
  const beatPlayer = {
    currentBeat: { id: 'beat-1', bpm: 60, title: 'Test Beat' },
    isPlaying: false,
    isLoading: false,
    error: null,
    connectTo: vi.fn(),
    prime: vi.fn(async () => undefined),
    setLoop: vi.fn(),
    play: vi.fn(async () => {
      beatPlayer.isPlaying = true
      return true
    }),
    pause: vi.fn(() => {
      beatPlayer.isPlaying = false
    }),
    stop: vi.fn(() => {
      beatPlayer.isPlaying = false
    }),
    setVolume: vi.fn(),
    getPreciseTime: vi.fn(() => 0),
  }

  return {
    beatPlayer,
    recorder: {
      isRecording: false,
      duration: 0,
      start: vi.fn(async () => undefined),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      setOnComplete: vi.fn(),
      setOnMaxDurationReached: vi.fn(),
    },
    tts: {
      speak: vi.fn(),
      warmup: vi.fn(() => true),
      cancel: vi.fn(),
    },
    audioSync: {
      initAudio: vi.fn(() => ({
        state: 'running',
        resume: vi.fn(async () => undefined),
      })),
      audioState: 'ready',
      getPreciseTime: vi.fn(() => 0),
    },
    session: {
      isTTSEnabled: true,
      ttsVolume: 0.5,
      beatVolume: 0.7,
      selectedLanguage: 'en-US',
      isStudioFXEnabled: true,
      startSession: vi.fn(),
      stopSession: vi.fn(),
    },
  }
})

vi.mock('@/hooks/useBeatPlayer', () => ({
  useBeatPlayer: () => mocks.beatPlayer,
}))

vi.mock('@/hooks/useRecording', () => ({
  useRecording: () => mocks.recorder,
}))

vi.mock('@/contexts/SessionContext', () => ({
  usePracticeSession: () => mocks.session,
}))

vi.mock('@/hooks/useTTS', () => ({
  useTTS: () => ({
    ...mocks.tts,
    voiceStatus: 'ready',
  }),
}))

vi.mock('@/hooks/player/useAudioSync', () => ({
  useAudioSync: () => mocks.audioSync,
}))

vi.mock('@/lib/telemetry/reliability', () => ({
  trackReliabilityEvent: vi.fn(),
  trackReliabilityException: vi.fn(),
}))

const beat = {
  id: 'beat-1',
  title: 'Test Beat',
  bpm: 60,
  storageUrl: '/beats/test.mp3',
} as unknown as Beat
const initialBeats = [beat]
const initialWords = [
  { wordText: 'station', difficultyLevel: 2, syllableCount: 2 },
]

describe('usePracticeEngine TTS timing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.beatPlayer.isPlaying = false
  })

  it('warms TTS during start, waits through countdown, then speaks the displayed prompt once', async () => {
    const { result } = renderHook(() =>
      usePracticeEngine({
        initialBeats,
        initialWords,
        frequency: 4,
        difficulty: 2,
        submitSession: vi.fn(async () => undefined),
        sessionDurationSeconds: 1,
      })
    )

    await act(async () => {
      await result.current.startSession()
    })

    expect(result.current.status).toBe('COUNTDOWN')
    expect(mocks.tts.warmup).toHaveBeenCalledTimes(1)
    expect(mocks.tts.speak).not.toHaveBeenCalled()

    await act(async () => {
      await result.current.completeCountdown()
    })

    expect(result.current.status).toBe('PLAYING')
    expect(mocks.tts.speak).toHaveBeenCalledTimes(1)
    expect(mocks.tts.speak).toHaveBeenCalledWith(result.current.currentWord)
  })

  it('cancels the current spoken prompt when the session pauses', async () => {
    const { result } = renderHook(() =>
      usePracticeEngine({
        initialBeats,
        initialWords,
        frequency: 4,
        difficulty: 2,
        submitSession: vi.fn(async () => undefined),
        sessionDurationSeconds: 1,
      })
    )

    await act(async () => {
      await result.current.startSession()
      await result.current.completeCountdown()
    })

    expect(mocks.tts.speak).toHaveBeenCalledTimes(1)

    await act(async () => {
      await result.current.togglePause()
    })

    expect(result.current.status).toBe('PAUSED')
    expect(mocks.tts.cancel).toHaveBeenCalled()
    expect(mocks.tts.speak).toHaveBeenCalledTimes(1)
  })
})

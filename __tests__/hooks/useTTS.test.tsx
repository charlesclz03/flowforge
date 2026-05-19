import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTTS } from '@/hooks/useTTS'
import { trackReliabilityEvent } from '@/lib/telemetry/reliability'

const mocks = vi.hoisted(() => ({
  initializeSpeechEngine: vi.fn(),
  speakWithSpeechEngine: vi.fn(),
  warmupSpeechEngine: vi.fn(() => true),
  cancelSpeechEngine: vi.fn(),
}))

vi.mock('@/lib/tts/speech-engine', () => ({
  initializeSpeechEngine: mocks.initializeSpeechEngine,
  speakWithSpeechEngine: mocks.speakWithSpeechEngine,
  warmupSpeechEngine: mocks.warmupSpeechEngine,
  cancelSpeechEngine: mocks.cancelSpeechEngine,
}))

vi.mock('@/lib/telemetry/reliability', () => ({
  trackReliabilityEvent: vi.fn(),
}))

function voice(lang: string): SpeechSynthesisVoice {
  return {
    default: false,
    lang,
    localService: true,
    name: `Voice ${lang}`,
    voiceURI: `voice-${lang}`,
  } as SpeechSynthesisVoice
}

describe('useTTS runtime failures', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: vi.fn(() => [voice('en-US')]),
        cancel: vi.fn(),
        speak: vi.fn(),
      },
    })

    mocks.initializeSpeechEngine.mockResolvedValue({
      mode: 'native',
      isReady: true,
      voiceStatus: 'ready',
      hasLanguageVoice: true,
      activeVoice: voice('en-US'),
    })
  })

  it('marks voice prompts unavailable when speech fails at runtime', async () => {
    const { result } = renderHook(() => useTTS({ language: 'en-US' }))

    await waitFor(() => expect(result.current.voiceStatus).toBe('ready'))

    act(() => {
      result.current.speak('flow')
    })

    const onError = mocks.speakWithSpeechEngine.mock.calls[0]?.[0]?.onError
    expect(onError).toBeTypeOf('function')

    act(() => {
      onError({ error: 'synthesis-failed' })
    })

    expect(result.current.isReady).toBe(false)
    expect(result.current.voiceStatus).toBe('unsupported')
    expect(trackReliabilityEvent).toHaveBeenCalledWith(
      'tts_speech_runtime_failure',
      expect.objectContaining({
        requestedLanguage: 'en-US',
        engineMode: 'native',
        activeVoiceLanguage: 'en-US',
        error: 'synthesis-failed',
      }),
      'warning'
    )
  })

  it('ignores expected cancel errors from pause and stop cleanup', async () => {
    const { result } = renderHook(() => useTTS({ language: 'en-US' }))

    await waitFor(() => expect(result.current.voiceStatus).toBe('ready'))

    act(() => {
      result.current.speak('flow')
    })

    const onError = mocks.speakWithSpeechEngine.mock.calls[0]?.[0]?.onError
    expect(onError).toBeTypeOf('function')

    act(() => {
      onError({ error: 'canceled' })
    })

    expect(result.current.isReady).toBe(true)
    expect(result.current.voiceStatus).toBe('ready')
    expect(trackReliabilityEvent).not.toHaveBeenCalledWith(
      'tts_speech_runtime_failure',
      expect.anything(),
      expect.anything()
    )
  })
})

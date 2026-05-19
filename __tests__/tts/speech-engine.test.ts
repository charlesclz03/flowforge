import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  initializeSpeechEngine,
  speakWithSpeechEngine,
  warmupSpeechEngine,
} from '@/lib/tts/speech-engine'

const easySpeechMock = vi.hoisted(() => ({
  init: vi.fn(async () => true),
  detect: vi.fn(() => ({
    speechSynthesis: {} as SpeechSynthesis,
    speechSynthesisUtterance: {} as SpeechSynthesisUtterance,
  })),
  voices: vi.fn(() => [] as SpeechSynthesisVoice[]),
  speak: vi.fn(async () => undefined),
  cancel: vi.fn(),
}))

vi.mock('easy-speech', () => ({
  default: easySpeechMock,
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

describe('speech engine adapter', () => {
  const nativeSpeak = vi.fn()
  const nativeCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    class MockUtterance {
      text: string
      lang = ''
      voice: SpeechSynthesisVoice | null = null
      volume = 1
      rate = 1
      pitch = 1

      constructor(text: string) {
        this.text = text
      }
    }

    Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: MockUtterance,
    })

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: vi.fn(() => []),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        speak: nativeSpeak,
        cancel: nativeCancel,
      },
    })
  })

  it('uses Easy Speech when initialization returns voices', async () => {
    easySpeechMock.voices.mockReturnValueOnce([voice('fr-FR')])

    const state = await initializeSpeechEngine({
      language: 'fr-FR',
      maxTimeoutMs: 1,
      intervalMs: 1,
    })

    expect(state.mode).toBe('easy-speech')
    expect(state.voiceStatus).toBe('ready')
    expect(state.hasLanguageVoice).toBe(true)
    expect(state.activeVoice?.lang).toBe('fr-FR')
  })

  it('falls back to audible native mode when no voices resolve', async () => {
    easySpeechMock.init.mockRejectedValueOnce(new Error('no voices'))

    const state = await initializeSpeechEngine({
      language: 'pt-PT',
      maxTimeoutMs: 1,
      intervalMs: 1,
    })

    expect(state.mode).toBe('native')
    expect(state.voiceStatus).toBe('fallback')
    expect(state.isReady).toBe(true)
    expect(state.activeVoice).toBeNull()
  })

  it('keeps native speech behavior available for speak and warmup', () => {
    const activeVoice = voice('en-US')

    speakWithSpeechEngine({
      mode: 'native',
      text: 'flow',
      activeVoice,
      utteranceLang: 'en-US',
      volume: 0.8,
      rate: 1,
      pitch: 1,
    })

    const warmed = warmupSpeechEngine({
      mode: 'native',
      activeVoice,
      utteranceLang: 'en-US',
    })

    expect(warmed).toBe(true)
    expect(nativeCancel).toHaveBeenCalledTimes(2)
    expect(nativeSpeak).toHaveBeenCalledTimes(2)
  })

  it('reports native speech runtime errors after voices look ready', () => {
    const activeVoice = voice('en-US')
    const onError = vi.fn()

    nativeSpeak.mockImplementationOnce(
      (utterance: SpeechSynthesisUtterance) => {
        utterance.onerror?.({
          error: 'synthesis-failed',
        } as SpeechSynthesisErrorEvent)
      }
    )

    speakWithSpeechEngine({
      mode: 'native',
      text: 'flow',
      activeVoice,
      utteranceLang: 'en-US',
      volume: 0.8,
      rate: 1,
      pitch: 1,
      onError,
    })

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'synthesis-failed' })
    )
  })

  it('passes runtime error handling through Easy Speech speak calls', async () => {
    const activeVoice = voice('en-US')
    const onError = vi.fn()

    speakWithSpeechEngine({
      mode: 'easy-speech',
      text: 'flow',
      activeVoice,
      utteranceLang: 'en-US',
      volume: 0.8,
      rate: 1,
      pitch: 1,
      onError,
    })

    await vi.waitFor(() =>
      expect(easySpeechMock.speak).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'flow',
          voice: activeVoice,
          error: onError,
        })
      )
    )
  })

  it('falls back to native speech when Easy Speech speak fails after init', async () => {
    const activeVoice = voice('fr-FR')
    easySpeechMock.speak.mockRejectedValueOnce(new Error('speech stalled'))

    speakWithSpeechEngine({
      mode: 'easy-speech',
      text: 'rythme',
      activeVoice,
      utteranceLang: 'fr-FR',
      volume: 0.7,
      rate: 1,
      pitch: 1,
    })

    await vi.waitFor(() =>
      expect(easySpeechMock.speak).toHaveBeenCalledWith({
        text: 'rythme',
        voice: activeVoice,
        volume: 0.7,
        rate: 1,
        pitch: 1,
        force: true,
        error: undefined,
      })
    )
    await vi.waitFor(() => expect(nativeSpeak).toHaveBeenCalledTimes(1))
    expect(nativeCancel).toHaveBeenCalledTimes(1)
  })

  it('falls back to native warmup when Easy Speech warmup fails', async () => {
    const activeVoice = voice('pt-PT')
    easySpeechMock.speak.mockRejectedValueOnce(new Error('warmup stalled'))

    const warmed = warmupSpeechEngine({
      mode: 'easy-speech',
      activeVoice,
      utteranceLang: 'pt-PT',
    })

    expect(warmed).toBe(true)
    await vi.waitFor(() =>
      expect(easySpeechMock.speak).toHaveBeenCalledWith({
        text: '.',
        voice: activeVoice,
        volume: 0,
        rate: 1,
        pitch: 1,
        force: true,
        error: undefined,
      })
    )
    await vi.waitFor(() => expect(nativeSpeak).toHaveBeenCalledTimes(1))
    expect(nativeCancel).toHaveBeenCalledTimes(1)
  })
})

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
})

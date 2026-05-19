import { getBestVoice, hasVoiceForLanguage } from '@/lib/tts/voice-picker'
import { TTSVoiceStatus } from '@/lib/tts/utterance-language'

export type SpeechEngineMode = 'easy-speech' | 'native'

export interface SpeechEngineState {
  mode: SpeechEngineMode
  isReady: boolean
  voiceStatus: TTSVoiceStatus
  hasLanguageVoice: boolean
  activeVoice: SpeechSynthesisVoice | null
}

export interface SpeechEngineOptions {
  language: string
  maxTimeoutMs?: number
  intervalMs?: number
}

export type SpeechRuntimeErrorHandler = (error: unknown) => void

interface EasySpeechModule {
  default: {
    init: (request: {
      maxTimeout: number
      interval: number
      quiet?: boolean
    }) => Promise<boolean>
    detect: () => {
      speechSynthesis: SpeechSynthesis | undefined
      speechSynthesisUtterance: SpeechSynthesisUtterance | undefined
    }
    voices: () => SpeechSynthesisVoice[]
    speak: (options: {
      text: string
      voice?: SpeechSynthesisVoice
      pitch?: number
      rate?: number
      volume?: number
      force?: boolean
      error?: SpeechRuntimeErrorHandler
    }) => Promise<unknown>
    cancel: () => void
  }
}

const DEFAULT_VOICE_LOAD_TIMEOUT_MS = 1500
const DEFAULT_VOICE_LOAD_INTERVAL_MS = 250

let easySpeechModulePromise: Promise<EasySpeechModule> | null = null

function canUseNativeSpeech(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  )
}

function resolveFromVoices(
  voices: SpeechSynthesisVoice[],
  language: string,
  mode: SpeechEngineMode
): SpeechEngineState {
  if (voices.length === 0) {
    return {
      mode,
      isReady: true,
      voiceStatus: 'fallback',
      hasLanguageVoice: false,
      activeVoice: null,
    }
  }

  const matching = hasVoiceForLanguage(voices, language)

  return {
    mode,
    isReady: true,
    voiceStatus: matching ? 'ready' : 'fallback',
    hasLanguageVoice: matching,
    activeVoice: getBestVoice(voices, language),
  }
}

async function loadEasySpeech(): Promise<EasySpeechModule> {
  easySpeechModulePromise ??= import('easy-speech') as Promise<EasySpeechModule>
  return easySpeechModulePromise
}

async function waitForNativeVoices({
  maxTimeoutMs,
  intervalMs,
}: Required<Pick<SpeechEngineOptions, 'maxTimeoutMs' | 'intervalMs'>>) {
  const synth = window.speechSynthesis
  const immediateVoices = synth.getVoices()
  if (immediateVoices.length > 0) return immediateVoices

  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const cleanup = () => {
      synth.removeEventListener('voiceschanged', loadVoices)
      if (intervalId) clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
    }

    const loadVoices = () => {
      const voices = synth.getVoices()
      if (voices.length > 0) {
        cleanup()
        resolve(voices)
      }
    }

    synth.addEventListener('voiceschanged', loadVoices)
    intervalId = setInterval(loadVoices, intervalMs)
    timeoutId = setTimeout(() => {
      cleanup()
      resolve(synth.getVoices())
    }, maxTimeoutMs)
  })
}

export async function initializeSpeechEngine({
  language,
  maxTimeoutMs = DEFAULT_VOICE_LOAD_TIMEOUT_MS,
  intervalMs = DEFAULT_VOICE_LOAD_INTERVAL_MS,
}: SpeechEngineOptions): Promise<SpeechEngineState> {
  if (!canUseNativeSpeech()) {
    return {
      mode: 'native',
      isReady: false,
      voiceStatus: 'unsupported',
      hasLanguageVoice: false,
      activeVoice: null,
    }
  }

  try {
    const easySpeech = await loadEasySpeech()
    const detected = easySpeech.default.detect()

    if (detected.speechSynthesis && detected.speechSynthesisUtterance) {
      await easySpeech.default.init({
        maxTimeout: maxTimeoutMs,
        interval: intervalMs,
        quiet: true,
      })

      const voices = easySpeech.default.voices()
      return resolveFromVoices(voices, language, 'easy-speech')
    }
  } catch {
    // Fall back to the native loader below. Easy Speech improves consistency,
    // but native speech must remain the recovery path on unusual engines.
  }

  const voices = await waitForNativeVoices({ maxTimeoutMs, intervalMs })
  return resolveFromVoices(voices, language, 'native')
}

export function speakWithSpeechEngine({
  mode,
  text,
  activeVoice,
  utteranceLang,
  volume,
  rate,
  pitch,
  onError,
}: {
  mode: SpeechEngineMode
  text: string
  activeVoice: SpeechSynthesisVoice | null
  utteranceLang: string
  volume: number
  rate: number
  pitch: number
  onError?: SpeechRuntimeErrorHandler
}) {
  if (!canUseNativeSpeech()) return

  window.speechSynthesis.cancel()

  if (mode === 'easy-speech' && activeVoice) {
    void loadEasySpeech()
      .then((easySpeech) =>
        easySpeech.default.speak({
          text,
          voice: activeVoice,
          volume,
          rate,
          pitch,
          force: true,
          error: onError,
        })
      )
      .catch(() => {
        speakNative({
          text,
          activeVoice,
          utteranceLang,
          volume,
          rate,
          pitch,
          onError,
        })
      })
    return
  }

  speakNative({
    text,
    activeVoice,
    utteranceLang,
    volume,
    rate,
    pitch,
    onError,
  })
}

export function warmupSpeechEngine({
  mode,
  activeVoice,
  utteranceLang,
  onError,
}: {
  mode: SpeechEngineMode
  activeVoice: SpeechSynthesisVoice | null
  utteranceLang: string
  onError?: SpeechRuntimeErrorHandler
}): boolean {
  if (!canUseNativeSpeech()) return false

  try {
    window.speechSynthesis.cancel()

    if (mode === 'easy-speech' && activeVoice) {
      void loadEasySpeech()
        .then((easySpeech) =>
          easySpeech.default.speak({
            text: '.',
            voice: activeVoice,
            volume: 0,
            rate: 1,
            pitch: 1,
            force: true,
            error: onError,
          })
        )
        .catch(() => {
          speakNative({
            text: '.',
            activeVoice,
            utteranceLang,
            volume: 0,
            rate: 1,
            pitch: 1,
            onError,
          })
        })
      return true
    }

    speakNative({
      text: '.',
      activeVoice,
      utteranceLang,
      volume: 0,
      rate: 1,
      pitch: 1,
      onError,
    })
    return true
  } catch {
    return false
  }
}

export function cancelSpeechEngine(mode: SpeechEngineMode) {
  if (!canUseNativeSpeech()) return

  window.speechSynthesis.cancel()

  if (mode === 'easy-speech') {
    void loadEasySpeech()
      .then((easySpeech) => easySpeech.default.cancel())
      .catch(() => undefined)
  }
}

function speakNative({
  text,
  activeVoice,
  utteranceLang,
  volume,
  rate,
  pitch,
  onError,
}: {
  text: string
  activeVoice: SpeechSynthesisVoice | null
  utteranceLang: string
  volume: number
  rate: number
  pitch: number
  onError?: SpeechRuntimeErrorHandler
}) {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = utteranceLang
  if (activeVoice) utterance.voice = activeVoice
  utterance.volume = volume
  utterance.rate = rate
  utterance.pitch = pitch
  utterance.onerror = (event) => onError?.(event)
  window.speechSynthesis.speak(utterance)
}

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  DEFAULT_TTS_LANGUAGE,
  TTSLanguageCode,
} from '@/lib/tts/languages'
import {
  resolveUtteranceLanguage,
  TTSVoiceStatus,
} from '@/lib/tts/utterance-language'
import { trackReliabilityEvent } from '@/lib/telemetry/reliability'
import {
  cancelSpeechEngine,
  initializeSpeechEngine,
  speakWithSpeechEngine,
  SpeechEngineMode,
  warmupSpeechEngine,
} from '@/lib/tts/speech-engine'

interface UseTTSProps {
  enabled?: boolean
  volume?: number // 0-1
  rate?: number // 0.1-10
  pitch?: number // 0-2
  language?: TTSLanguageCode
}

export type { TTSVoiceStatus } from '@/lib/tts/utterance-language'
const VOICE_LOAD_TIMEOUT_MS = 1500

export function useTTS({
  enabled = true,
  volume = 1,
  rate = 1,
  pitch = 1,
  language = DEFAULT_TTS_LANGUAGE,
}: UseTTSProps = {}) {
  const [isReady, setIsReady] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<TTSVoiceStatus>('loading')
  const [hasLanguageVoice, setHasLanguageVoice] = useState(false)
  const [activeVoice, setActiveVoice] = useState<SpeechSynthesisVoice | null>(
    null
  )
  const [engineMode, setEngineMode] = useState<SpeechEngineMode>('native')

  // Refs to avoid closure staleness in async callbacks
  const mountedRef = useRef(true)
  const lastTelemetryKeyRef = useRef<string | null>(null)

  // Initialize Voices
  useEffect(() => {
    mountedRef.current = true
    setVoiceStatus('loading')

    void initializeSpeechEngine({
      language,
      maxTimeoutMs: VOICE_LOAD_TIMEOUT_MS,
    }).then((state) => {
      if (!mountedRef.current) return
      setEngineMode(state.mode)
      setHasLanguageVoice(state.hasLanguageVoice)
      setActiveVoice(state.activeVoice)
      setIsReady(state.isReady)
      setVoiceStatus(state.voiceStatus)
    })

    return () => {
      mountedRef.current = false
    }
  }, [language])

  useEffect(() => {
    if (voiceStatus === 'loading') return

    const telemetryKey = `${language}:${voiceStatus}:${activeVoice?.lang ?? 'none'}`
    if (lastTelemetryKeyRef.current === telemetryKey) {
      return
    }
    lastTelemetryKeyRef.current = telemetryKey

    if (voiceStatus === 'ready') {
      return
    }

    trackReliabilityEvent(
      'tts_voice_mode_resolved',
      {
        requestedLanguage: language,
        voiceStatus,
        hasLanguageVoice,
        activeVoiceLanguage: activeVoice?.lang ?? null,
      },
      voiceStatus === 'unsupported' ? 'warning' : 'info'
    )
  }, [activeVoice?.lang, hasLanguageVoice, language, voiceStatus])

  const speak = useCallback(
    (text: string) => {
      if (!enabled || !text) return
      if (typeof window === 'undefined' || !window.speechSynthesis) return

      // 1. Cancel existing (Crucial for mobile/fast skipping)
      const utteranceLang = resolveUtteranceLanguage({
        requestedLanguage: language,
        activeVoice,
        voiceStatus,
      })

      // Mobile Hardening: Some browsers require a user gesture to "unlock" TTS first.
      // There isn't a great way to "catch" that failure other than ensuring this
      // is called from a useEffect that was triggered by a user-driven state change.
      speakWithSpeechEngine({
        mode: engineMode,
        text,
        activeVoice,
        utteranceLang,
        volume,
        rate,
        pitch,
      })
    },
    [
      enabled,
      activeVoice,
      volume,
      rate,
      pitch,
      language,
      voiceStatus,
      engineMode,
    ]
  )

  const warmup = useCallback((): boolean => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false

    try {
      const utteranceLang = resolveUtteranceLanguage({
        requestedLanguage: language,
        activeVoice,
        voiceStatus,
      })
      return warmupSpeechEngine({
        mode: engineMode,
        activeVoice,
        utteranceLang,
      })
    } catch {
      return false
    }
  }, [language, activeVoice, voiceStatus, engineMode])

  const cancel = useCallback(() => {
    cancelSpeechEngine(engineMode)
  }, [engineMode])

  return {
    speak,
    warmup,
    cancel,
    isReady,
    activeVoice,
    hasLanguageVoice,
    voiceStatus,
  }
}

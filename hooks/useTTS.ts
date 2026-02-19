import { useState, useEffect, useCallback, useRef } from 'react'
import { getBestVoice, hasVoiceForLanguage } from '@/lib/tts/voice-picker'
import {
  DEFAULT_TTS_LANGUAGE,
  TTSLanguageCode,
} from '@/lib/tts/languages'
import {
  resolveUtteranceLanguage,
  TTSVoiceStatus,
} from '@/lib/tts/utterance-language'

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

  // Refs to avoid closure staleness in async callbacks
  const mountedRef = useRef(true)

  // Initialize Voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setVoiceStatus('unsupported')
      setHasLanguageVoice(false)
      setIsReady(false)
      setActiveVoice(null)
      return
    }

    mountedRef.current = true
    setVoiceStatus('loading')
    const synth = window.speechSynthesis
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const loadVoices = () => {
      const voices = synth.getVoices()
      if (voices.length > 0) {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        const matching = hasVoiceForLanguage(voices, language)
        const best = getBestVoice(voices, language)
        if (mountedRef.current) {
          setHasLanguageVoice(matching)
          setActiveVoice(best)
          setIsReady(true)
          setVoiceStatus(matching ? 'ready' : 'fallback')
        }
      }
    }

    // Chrome loads voices asynchronously
    loadVoices()
    synth.addEventListener('voiceschanged', loadVoices)
    timeoutId = setTimeout(() => {
      if (!mountedRef.current) return
      const voices = synth.getVoices()
      if (voices.length > 0) return

      // Stay audible even when engines never expose voices.
      setHasLanguageVoice(false)
      setActiveVoice(null)
      setIsReady(true)
      setVoiceStatus('fallback')
    }, VOICE_LOAD_TIMEOUT_MS)

    return () => {
      mountedRef.current = false
      synth.removeEventListener('voiceschanged', loadVoices)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [language])

  const speak = useCallback(
    (text: string) => {
      if (!enabled || !text) return
      if (typeof window === 'undefined' || !window.speechSynthesis) return

      // 1. Cancel existing (Crucial for mobile/fast skipping)
      window.speechSynthesis.cancel()

      // 2. Create Utterance
      const u = new SpeechSynthesisUtterance(text)

      // 3. Apply Settings
      u.lang = resolveUtteranceLanguage({
        requestedLanguage: language,
        activeVoice,
        voiceStatus,
      })
      if (activeVoice) u.voice = activeVoice
      u.volume = volume
      u.rate = rate
      u.pitch = pitch

      // 4. Speak
      // Mobile Hardening: Some browsers require a user gesture to "unlock" TTS first.
      // There isn't a great way to "catch" that failure other than ensuring this
      // is called from a useEffect that was triggered by a user-driven state change.
      window.speechSynthesis.speak(u)
    },
    [enabled, activeVoice, volume, rate, pitch, language, voiceStatus]
  )

  const warmup = useCallback((): boolean => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false

    try {
      const u = new SpeechSynthesisUtterance('.')
      u.lang = resolveUtteranceLanguage({
        requestedLanguage: language,
        activeVoice,
        voiceStatus,
      })
      if (activeVoice) u.voice = activeVoice
      u.volume = 0
      u.rate = 1
      u.pitch = 1

      // Clear stale queue first, then trigger a silent no-op utterance from user gesture.
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
      return true
    } catch {
      return false
    }
  }, [language, activeVoice, voiceStatus])

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

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

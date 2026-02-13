import { useState, useEffect, useCallback, useRef } from 'react'
import { getBestVoice, hasVoiceForLanguage } from '@/lib/tts/voice-picker'
import { DEFAULT_TTS_LANGUAGE, TTSLanguageCode } from '@/lib/tts/languages'

interface UseTTSProps {
  enabled?: boolean
  volume?: number // 0-1
  rate?: number // 0.1-10
  pitch?: number // 0-2
  language?: TTSLanguageCode
}

export type TTSVoiceStatus = 'unsupported' | 'loading' | 'ready' | 'fallback'

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

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
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
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      mountedRef.current = false
      window.speechSynthesis.onvoiceschanged = null
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
      u.lang = language
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
    [enabled, activeVoice, volume, rate, pitch, language]
  )

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  return {
    speak,
    cancel,
    isReady,
    activeVoice,
    hasLanguageVoice,
    voiceStatus,
  }
}

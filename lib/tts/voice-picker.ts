/**
 * Smart Voice Picker for FlowForge
 *
 * Browsers default to the "Native" voice, which is often robotic.
 * This utility ranks available voices to find a "Premium" sounding one.
 */

export interface VoicePreference {
  lang: string
  name?: string
  priority: number
}

// Higher priority = better
const PREFERRED_VOICES: VoicePreference[] = [
  // Tier 1: Premium Neural/Natural Voices
  { lang: 'en-US', name: 'Google US English', priority: 100 },
  { lang: 'en-US', name: 'Samantha', priority: 90 }, // iOS Premium
  { lang: 'en-GB', name: 'Daniel', priority: 85 }, // iOS Premium GB
  { lang: 'en-US', name: 'Microsoft Zira', priority: 80 }, // Windows

  // Tier 2: Standard English
  { lang: 'en-US', priority: 50 },
  { lang: 'en-GB', priority: 40 },

  // Tier 3: Any English
  { lang: 'en', priority: 10 },
]

export const getBestVoice = (
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null => {
  if (!voices || voices.length === 0) return null

  // 1. Filter for English only to simplify
  const englishVoices = voices.filter((v) => v.lang.startsWith('en'))

  if (englishVoices.length === 0) return voices[0] // Fallback to anything

  // 2. Score each voice
  const scored = englishVoices.map((voice) => {
    let score = 0

    // Check preferences
    for (const pref of PREFERRED_VOICES) {
      if (
        voice.lang === pref.lang ||
        (pref.lang === 'en' && voice.lang.startsWith('en'))
      ) {
        if (pref.name) {
          if (voice.name.includes(pref.name)) {
            score += pref.priority
          }
        } else {
          score += pref.priority
        }
        // Break after first valid match tier to avoid double counting?
        // Actually, specific name match should boost significantly.
      }
    }

    // Penalty for "local" only if we have a remote option?
    // Actually, localService is usually better for latency, but worse for quality?
    // On Chrome, "Google US English" is remote but fast.

    return { voice, score }
  })

  // 3. Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  return scored[0].voice
}

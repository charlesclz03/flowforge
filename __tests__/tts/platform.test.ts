import { describe, expect, it } from 'vitest'
import {
  IOS_SPOKEN_PROMPT_NOTICE,
  getEffectiveTTSEnabled,
} from '@/lib/tts/platform'

describe('tts platform helper', () => {
  it('disables spoken prompts on iOS devices', () => {
    expect(getEffectiveTTSEnabled(true, true)).toBe(false)
    expect(getEffectiveTTSEnabled(true, true, false)).toBe(false)
    expect(getEffectiveTTSEnabled(true, true, true)).toBe(true)
    expect(getEffectiveTTSEnabled(false, true)).toBe(false)
    expect(getEffectiveTTSEnabled(false, true, true)).toBe(false)
    expect(getEffectiveTTSEnabled(true, false)).toBe(true)
  })

  it('documents the iOS spoken-prompt fallback clearly', () => {
    expect(IOS_SPOKEN_PROMPT_NOTICE.toLowerCase()).toContain('iphone')
    expect(IOS_SPOKEN_PROMPT_NOTICE.toLowerCase()).toContain('beat volume')
  })
})

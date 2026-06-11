import { describe, expect, it } from 'vitest'
import { getVoiceStatusNotice } from '@/lib/tts/voice-status-copy'

describe('voice status copy', () => {
  it('returns no notice when voice prompts are disabled or ready', () => {
    expect(
      getVoiceStatusNotice({ isTTSEnabled: false, voiceStatus: 'fallback' })
    ).toBeNull()
    expect(getVoiceStatusNotice({ voiceStatus: 'ready' })).toBeNull()
  })

  it('explains iOS text-only mode before generic voice states', () => {
    const notice = getVoiceStatusNotice({
      isIOS: true,
      voiceStatus: 'unsupported',
      spokenPromptNotice: 'iPhone keeps prompts visual to protect beat volume.',
    })

    expect(notice).toEqual({
      tone: 'info',
      title: 'Text-only prompts',
      message: 'iPhone keeps prompts visual to protect beat volume.',
    })
  })

  it('supports explicit titles for iOS spoken prompt beta notices', () => {
    const notice = getVoiceStatusNotice({
      spokenPromptNoticeTitle: 'iPhone Voice Beta',
      spokenPromptNotice:
        'Spoken prompts are enabled experimentally on this device.',
      voiceStatus: 'ready',
    })

    expect(notice).toEqual({
      tone: 'info',
      title: 'iPhone Voice Beta',
      message: 'Spoken prompts are enabled experimentally on this device.',
    })
  })

  it('explains loading, unsupported, and fallback voice states', () => {
    expect(getVoiceStatusNotice({ voiceStatus: 'loading' })).toMatchObject({
      tone: 'info',
      title: 'Checking voice packs',
    })
    expect(getVoiceStatusNotice({ voiceStatus: 'unsupported' })).toMatchObject({
      tone: 'warning',
      title: 'Voice prompts unavailable',
    })
    expect(
      getVoiceStatusNotice({
        voiceStatus: 'fallback',
        activeVoiceName: 'System English',
      })
    ).toMatchObject({
      tone: 'warning',
      title: 'Fallback voice active',
      message: expect.stringContaining('System English'),
    })
  })
})

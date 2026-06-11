import type { TTSVoiceStatus } from '@/lib/tts/utterance-language'

export type VoiceStatusNoticeTone = 'info' | 'warning'

export interface VoiceStatusNotice {
  tone: VoiceStatusNoticeTone
  title: string
  message: string
}

interface VoiceStatusNoticeOptions {
  isTTSEnabled?: boolean
  isIOS?: boolean
  spokenPromptNoticeTitle?: string
  spokenPromptNotice?: string | null
  voiceStatus?: TTSVoiceStatus
  activeVoiceName?: string | null
}

export function getVoiceStatusNotice({
  isTTSEnabled = true,
  isIOS = false,
  spokenPromptNoticeTitle,
  spokenPromptNotice,
  voiceStatus,
  activeVoiceName,
}: VoiceStatusNoticeOptions): VoiceStatusNotice | null {
  if (!isTTSEnabled) return null

  if (isIOS || spokenPromptNotice) {
    return {
      tone: 'info',
      title: spokenPromptNoticeTitle ?? 'Text-only prompts',
      message:
        spokenPromptNotice ??
        'Voice prompts stay off on iPhone and iPad so the beat volume stays stable.',
    }
  }

  if (voiceStatus === 'loading') {
    return {
      tone: 'info',
      title: 'Checking voice packs',
      message:
        'Voice prompts will start when a compatible browser voice is ready.',
    }
  }

  if (voiceStatus === 'unsupported') {
    return {
      tone: 'warning',
      title: 'Voice prompts unavailable',
      message:
        'This browser cannot speak prompts. On-screen words will stay active.',
    }
  }

  if (voiceStatus === 'fallback') {
    return {
      tone: 'warning',
      title: 'Fallback voice active',
      message: activeVoiceName
        ? `Using fallback voice: ${activeVoiceName}. Install a matching language voice for best results.`
        : 'Using a fallback voice. Install a matching language voice for best results.',
    }
  }

  return null
}

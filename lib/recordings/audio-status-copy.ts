export type RecordingAudioStatus = 'ready' | 'processing' | 'stats-only'

export interface RecordingAudioStatusCopy {
  label: string
  description: string
  reviewTitle: string
  reviewDescription: string
}

export function resolveRecordingAudioStatus({
  storageUrl,
  audioStatus,
}: {
  storageUrl?: string | null
  audioStatus?: RecordingAudioStatus | null
}): RecordingAudioStatus {
  if (audioStatus) return audioStatus
  if (typeof storageUrl === 'string' && storageUrl.startsWith('http')) {
    return 'ready'
  }
  if (storageUrl) return 'processing'
  return 'stats-only'
}

export function getRecordingAudioStatusCopy(
  audioStatus: RecordingAudioStatus
): RecordingAudioStatusCopy {
  if (audioStatus === 'ready') {
    return {
      label: 'Audio ready',
      description: 'Audio is ready for playback, review, sharing, and export.',
      reviewTitle: 'Audio review ready',
      reviewDescription: 'Waveform review and studio controls are available.',
    }
  }

  if (audioStatus === 'processing') {
    return {
      label: 'Audio processing',
      description:
        'Audio is still preparing. Refresh in a moment to check playback.',
      reviewTitle: 'Audio is still processing',
      reviewDescription:
        'The take is saved, but waveform review will unlock after audio is ready.',
    }
  }

  return {
    label: 'Stats-only practice',
    description:
      'No microphone audio was captured. Practice stats are saved without playback controls.',
    reviewTitle: 'Stats-only practice saved',
    reviewDescription:
      'This run saved practice metadata only, so waveform review and audio export are unavailable.',
  }
}

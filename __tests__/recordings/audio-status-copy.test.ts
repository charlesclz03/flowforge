import { describe, expect, it } from 'vitest'
import {
  getRecordingAudioStatusCopy,
  resolveRecordingAudioStatus,
} from '@/lib/recordings/audio-status-copy'

describe('recording audio status copy', () => {
  it('resolves ready, processing, and stats-only states without changing API values', () => {
    expect(
      resolveRecordingAudioStatus({ storageUrl: 'https://signed/audio.webm' })
    ).toBe('ready')
    expect(resolveRecordingAudioStatus({ storageUrl: 'user/audio.webm' })).toBe(
      'processing'
    )
    expect(resolveRecordingAudioStatus({ storageUrl: null })).toBe('stats-only')
    expect(
      resolveRecordingAudioStatus({
        storageUrl: 'https://signed/audio.webm',
        audioStatus: 'stats-only',
      })
    ).toBe('stats-only')
  })

  it('keeps stats-only copy clear about absent audio controls', () => {
    const copy = getRecordingAudioStatusCopy('stats-only')

    expect(copy.label).toBe('Stats-only practice')
    expect(copy.description).toContain('without playback controls')
    expect(copy.reviewDescription).toContain('audio export are unavailable')
  })
})

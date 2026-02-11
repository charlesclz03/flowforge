import { describe, expect, it } from 'vitest'
import { resolveRecordingSync } from '@/lib/audio/recording-sync'

describe('resolveRecordingSync', () => {
  it('uses fxConfig.nudge when present', () => {
    expect(
      resolveRecordingSync({ beatOffsetMs: 1234, fxConfig: { nudge: 55 } })
    ).toEqual({ beatOffsetMs: 1234, nudgeMs: 55 })
  })

  it('treats legacy beatOffsetMs as nudge when fxConfig is absent', () => {
    expect(resolveRecordingSync({ beatOffsetMs: 120, fxConfig: null })).toEqual(
      {
        beatOffsetMs: 0,
        nudgeMs: 120,
      }
    )
  })

  it('does not misclassify beatOffsetMs when fxConfig exists without nudge', () => {
    expect(
      resolveRecordingSync({ beatOffsetMs: 120, fxConfig: { voiceVolume: 1 } })
    ).toEqual({ beatOffsetMs: 120, nudgeMs: 0 })
  })
})

import { describe, expect, it } from 'vitest'
import {
  normalizeLoopPosition,
  normalizeLoopStart,
} from '@/lib/audio/seamless-looper'

describe('seamless looper utilities', () => {
  it('normalizes invalid or non-positive loop starts to full-track playback', () => {
    expect(normalizeLoopStart(undefined, 10)).toBe(0)
    expect(normalizeLoopStart(Number.NaN, 10)).toBe(0)
    expect(normalizeLoopStart(-2, 10)).toBe(0)
    expect(normalizeLoopStart(0, 10)).toBe(0)
  })

  it('clamps calibrated loop starts just before the track end', () => {
    expect(normalizeLoopStart(9, 12)).toBe(9)
    expect(normalizeLoopStart(99, 12)).toBeCloseTo(11.99)
  })

  it('wraps full-track positions without producing negative playback time', () => {
    expect(normalizeLoopPosition(2, 10)).toBe(2)
    expect(normalizeLoopPosition(12.5, 10)).toBe(2.5)
    expect(normalizeLoopPosition(-1, 10)).toBe(9)
  })

  it('wraps calibrated tracks back to the saved cue point', () => {
    expect(normalizeLoopPosition(8, 12, 9)).toBe(9)
    expect(normalizeLoopPosition(10.5, 12, 9)).toBe(10.5)
    expect(normalizeLoopPosition(12.25, 12, 9)).toBe(9.25)
    expect(normalizeLoopPosition(15.25, 12, 9)).toBe(9.25)
  })
})

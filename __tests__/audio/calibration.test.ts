import { beforeEach, describe, expect, it } from 'vitest'
import {
  LATENCY_ACTIVE_PROFILE_STORAGE_KEY,
  LATENCY_PROFILES_STORAGE_KEY,
  LATENCY_STORAGE_KEY,
  computeCalibrationFromTapDiffs,
  formatSignedLatencyMs,
  getCalibrationState,
  normalizeLatencyMs,
  saveCalibrationState,
} from '@/lib/audio/calibration'

describe('audio calibration utilities', () => {
  beforeEach(() => {
    const memoryStore = new Map<string, string>()
    const mockStorage: Storage = {
      get length() {
        return memoryStore.size
      },
      clear: () => memoryStore.clear(),
      getItem: (key: string) => memoryStore.get(key) ?? null,
      key: (index: number) => Array.from(memoryStore.keys())[index] ?? null,
      removeItem: (key: string) => {
        memoryStore.delete(key)
      },
      setItem: (key: string, value: string) => {
        memoryStore.set(key, value)
      },
    }

    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      configurable: true,
      writable: true,
    })

    window.localStorage.removeItem(LATENCY_STORAGE_KEY)
    window.localStorage.removeItem(LATENCY_PROFILES_STORAGE_KEY)
    window.localStorage.removeItem(LATENCY_ACTIVE_PROFILE_STORAGE_KEY)
  })

  it('normalizes latency values with clamp + snap', () => {
    expect(normalizeLatencyMs(27)).toBe(30)
    expect(normalizeLatencyMs(-16)).toBe(-20)
    expect(normalizeLatencyMs(500)).toBe(200)
    expect(normalizeLatencyMs(-999)).toBe(-200)
  })

  it('formats signed latency values for UI', () => {
    expect(formatSignedLatencyMs(40)).toBe('+40ms')
    expect(formatSignedLatencyMs(-20)).toBe('-20ms')
    expect(formatSignedLatencyMs(0)).toBe('0ms')
  })

  it('computes stable calibration from tap diffs and discards outliers', () => {
    const result = computeCalibrationFromTapDiffs([20, 30, 40, 50, 200])

    expect(result.latencyMs).toBe(40)
    expect(result.usedSamples).toBeLessThan(5)
    expect(result.discardedSamples).toBeGreaterThan(0)
  })

  it('stores and restores profile-aware calibration state', () => {
    const saved = saveCalibrationState({
      activeProfileId: 'bluetooth',
      profiles: {
        phone_speaker: 10,
        wired_headphones: -30,
        bluetooth: 87,
      },
    })

    expect(saved.activeProfileId).toBe('bluetooth')
    expect(saved.profiles.bluetooth).toBe(90)

    const restored = getCalibrationState()
    expect(restored.activeProfileId).toBe('bluetooth')
    expect(restored.profiles.phone_speaker).toBe(10)
    expect(restored.profiles.wired_headphones).toBe(-30)
    expect(restored.profiles.bluetooth).toBe(90)
    expect(window.localStorage.getItem(LATENCY_STORAGE_KEY)).toBe('90')
  })
})

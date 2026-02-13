export const LATENCY_STORAGE_KEY = 'flowforge_latency'
export const LATENCY_PROFILES_STORAGE_KEY = 'flowforge_latency_profiles_v1'
export const LATENCY_ACTIVE_PROFILE_STORAGE_KEY = 'flowforge_latency_profile_v1'

export const CALIBRATION_MIN_MS = -200
export const CALIBRATION_MAX_MS = 200
export const CALIBRATION_STEP_MS = 10

export type CalibrationProfileId =
  | 'phone_speaker'
  | 'wired_headphones'
  | 'bluetooth'

export interface CalibrationProfileDefinition {
  id: CalibrationProfileId
  label: string
  description: string
}

export interface CalibrationState {
  activeProfileId: CalibrationProfileId
  profiles: Record<CalibrationProfileId, number>
}

export interface CalibrationComputation {
  latencyMs: number
  usedSamples: number
  discardedSamples: number
  medianMs: number
}

export const CALIBRATION_PROFILES: CalibrationProfileDefinition[] = [
  {
    id: 'phone_speaker',
    label: 'Phone Speaker',
    description: 'Built-in speaker output',
  },
  {
    id: 'wired_headphones',
    label: 'Wired',
    description: '3.5mm / USB-C wired output',
  },
  {
    id: 'bluetooth',
    label: 'Bluetooth',
    description: 'Wireless earbuds or headset',
  },
]

export const DEFAULT_CALIBRATION_PROFILE_ID: CalibrationProfileId =
  'phone_speaker'

export function clampLatencyMs(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(CALIBRATION_MIN_MS, Math.min(CALIBRATION_MAX_MS, value))
}

export function snapLatencyMs(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value / CALIBRATION_STEP_MS) * CALIBRATION_STEP_MS
}

export function normalizeLatencyMs(value: number): number {
  return snapLatencyMs(clampLatencyMs(value))
}

export function formatSignedLatencyMs(value: number): string {
  const normalized = normalizeLatencyMs(value)
  return normalized > 0 ? `+${normalized}ms` : `${normalized}ms`
}

function parseProfileId(input: unknown): CalibrationProfileId {
  if (
    input === 'phone_speaker' ||
    input === 'wired_headphones' ||
    input === 'bluetooth'
  ) {
    return input
  }
  return DEFAULT_CALIBRATION_PROFILE_ID
}

function parseLegacyLatency(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return normalizeLatencyMs(raw)
  }

  if (typeof raw === 'string') {
    const parsed = Number.parseInt(raw, 10)
    if (Number.isFinite(parsed)) {
      return normalizeLatencyMs(parsed)
    }
  }

  return 0
}

function defaultProfiles(
  baseLatencyMs: number = 0
): Record<CalibrationProfileId, number> {
  const normalized = normalizeLatencyMs(baseLatencyMs)
  return {
    phone_speaker: normalized,
    wired_headphones: normalized,
    bluetooth: normalized,
  }
}

function parseProfiles(raw: unknown): Record<CalibrationProfileId, number> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return defaultProfiles(0)
  }

  const obj = raw as Record<string, unknown>

  return {
    phone_speaker: parseLegacyLatency(obj.phone_speaker),
    wired_headphones: parseLegacyLatency(obj.wired_headphones),
    bluetooth: parseLegacyLatency(obj.bluetooth),
  }
}

function buildStateFromStorage(): CalibrationState {
  if (typeof window === 'undefined') {
    return {
      activeProfileId: DEFAULT_CALIBRATION_PROFILE_ID,
      profiles: defaultProfiles(0),
    }
  }

  const legacyLatencyMs = parseLegacyLatency(
    window.localStorage.getItem(LATENCY_STORAGE_KEY)
  )

  let activeProfileId = DEFAULT_CALIBRATION_PROFILE_ID
  let profiles = defaultProfiles(legacyLatencyMs)

  const activeRaw = window.localStorage.getItem(
    LATENCY_ACTIVE_PROFILE_STORAGE_KEY
  )
  if (activeRaw) {
    activeProfileId = parseProfileId(activeRaw)
  }

  const profilesRaw = window.localStorage.getItem(LATENCY_PROFILES_STORAGE_KEY)
  if (profilesRaw) {
    try {
      profiles = parseProfiles(JSON.parse(profilesRaw))
    } catch {
      profiles = defaultProfiles(legacyLatencyMs)
    }
  }

  const activeLatencyMs = profiles[activeProfileId]
  window.localStorage.setItem(
    LATENCY_STORAGE_KEY,
    String(normalizeLatencyMs(activeLatencyMs))
  )

  return {
    activeProfileId,
    profiles,
  }
}

export function getCalibrationState(): CalibrationState {
  return buildStateFromStorage()
}

export function saveCalibrationState(
  state: CalibrationState
): CalibrationState {
  const normalizedState: CalibrationState = {
    activeProfileId: parseProfileId(state.activeProfileId),
    profiles: parseProfiles(state.profiles),
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      LATENCY_ACTIVE_PROFILE_STORAGE_KEY,
      normalizedState.activeProfileId
    )
    window.localStorage.setItem(
      LATENCY_PROFILES_STORAGE_KEY,
      JSON.stringify(normalizedState.profiles)
    )
    window.localStorage.setItem(
      LATENCY_STORAGE_KEY,
      String(normalizedState.profiles[normalizedState.activeProfileId])
    )
  }

  return normalizedState
}

export function getActiveCalibrationMs(): number {
  const state = getCalibrationState()
  return state.profiles[state.activeProfileId]
}

export function setActiveCalibrationProfile(
  profileId: CalibrationProfileId
): CalibrationState {
  const state = getCalibrationState()
  return saveCalibrationState({
    ...state,
    activeProfileId: parseProfileId(profileId),
  })
}

export function setCalibrationForProfile(
  profileId: CalibrationProfileId,
  latencyMs: number
): CalibrationState {
  const state = getCalibrationState()
  return saveCalibrationState({
    ...state,
    profiles: {
      ...state.profiles,
      [parseProfileId(profileId)]: normalizeLatencyMs(latencyMs),
    },
  })
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  return sorted[middle]
}

export function computeCalibrationFromTapDiffs(
  rawTapDiffsMs: number[]
): CalibrationComputation {
  const tapDiffs = rawTapDiffsMs
    .filter((value) => Number.isFinite(value))
    .map((value) => clampLatencyMs(Math.trunc(value)))

  if (tapDiffs.length === 0) {
    return {
      latencyMs: 0,
      usedSamples: 0,
      discardedSamples: 0,
      medianMs: 0,
    }
  }

  const center = median(tapDiffs)
  const deviations = tapDiffs.map((value) => Math.abs(value - center))
  const mad = median(deviations)
  const threshold = Math.max(20, mad * 2.5)

  const outlierFiltered = tapDiffs.filter(
    (value) => Math.abs(value - center) <= threshold
  )

  const stable = outlierFiltered.length >= 3 ? outlierFiltered : tapDiffs

  let averaged = stable
  if (stable.length >= 5) {
    const sorted = [...stable].sort((a, b) => a - b)
    averaged = sorted.slice(1, -1)
  }

  const mean =
    averaged.reduce((sum, value) => sum + value, 0) /
    Math.max(averaged.length, 1)

  return {
    latencyMs: normalizeLatencyMs(mean),
    usedSamples: averaged.length,
    discardedSamples: tapDiffs.length - averaged.length,
    medianMs: normalizeLatencyMs(center),
  }
}

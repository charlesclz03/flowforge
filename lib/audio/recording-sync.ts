export function resolveRecordingSync(input: {
  beatOffsetMs?: number | null
  fxConfig?: unknown
}): { beatOffsetMs: number; nudgeMs: number } {
  const rawBeatOffsetMs =
    typeof input.beatOffsetMs === 'number' &&
    Number.isFinite(input.beatOffsetMs)
      ? Math.trunc(input.beatOffsetMs)
      : 0

  const fx =
    input.fxConfig && typeof input.fxConfig === 'object'
      ? (input.fxConfig as Record<string, unknown>)
      : null

  const fxNudgeMs =
    fx && typeof fx.nudge === 'number' && Number.isFinite(fx.nudge)
      ? Math.trunc(fx.nudge)
      : null

  if (fxNudgeMs !== null) {
    return { beatOffsetMs: rawBeatOffsetMs, nudgeMs: fxNudgeMs }
  }

  // Legacy compatibility:
  // - Older sessions stored "nudge" in `beatOffsetMs` (typically within +/- a few hundred ms).
  // - In that case we treat the beat phase offset as 0 and use the value as nudge.
  // Only apply this heuristic when no `fxConfig` exists to avoid misclassifying
  // newer sessions that have FX config but don't include `nudge`.
  if (!fx && Math.abs(rawBeatOffsetMs) <= 500) {
    return { beatOffsetMs: 0, nudgeMs: rawBeatOffsetMs }
  }

  return { beatOffsetMs: rawBeatOffsetMs, nudgeMs: 0 }
}

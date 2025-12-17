'use client'

import { useCallback } from 'react'

export function useHaptics() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern)
      } catch (e) {
        // Ignore errors (some browsers restrict vibration)
      }
    }
  }, [])

  const bump = useCallback(() => vibrate(10), [vibrate])
  const success = useCallback(() => vibrate([10, 30, 10]), [vibrate])
  const error = useCallback(() => vibrate([50, 30, 50]), [vibrate])

  return { vibrate, bump, success, error }
}

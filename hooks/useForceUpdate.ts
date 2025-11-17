'use client'

import { useState, useCallback } from 'react'

/**
 * Hook to force a component re-render
 * Better alternative to useState(0) + setState(n => n + 1)
 */
export function useForceUpdate() {
  const [, setTick] = useState(0)
  return useCallback(() => setTick(t => t + 1), [])
}


import { useEffect, useRef, useState, useCallback } from 'react'

export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wakeLock = useRef<any | null>(null)

  const requestLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wakeLock.current = await (navigator as any).wakeLock.request('screen')
        setIsLocked(true)

        wakeLock.current.addEventListener('release', () => {
          setIsLocked(false)
        })
      } catch (err) {
        console.error(`${(err as Error).name}, ${(err as Error).message}`)
      }
    }
  }, [])

  const releaseLock = useCallback(async () => {
    if (wakeLock.current) {
      await wakeLock.current.release()
      wakeLock.current = null
      setIsLocked(false)
    }
  }, [])

  useEffect(() => {
    // Re-acquire lock if visibility changes (e.g. tab switch)
    const handleVisibilityChange = () => {
      if (wakeLock.current !== null && document.visibilityState === 'visible') {
        requestLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      releaseLock()
    }
  }, [requestLock, releaseLock])

  return { isLocked, requestLock, releaseLock }
}

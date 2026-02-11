'use client'

import { useEffect } from 'react'

interface LockMainScrollProps {
  enabled?: boolean
}

export function LockMainScroll({ enabled = true }: LockMainScrollProps) {
  useEffect(() => {
    if (!enabled) return

    const main = document.getElementById('main-content')
    if (!main) return

    const previousOverflow = main.style.overflow
    main.style.overflow = 'hidden'

    return () => {
      main.style.overflow = previousOverflow
    }
  }, [enabled])

  return null
}

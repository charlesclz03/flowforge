import { useState, useEffect } from 'react'

export function useDevice() {
  const [isAndroid, setIsAndroid] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const userAgent =
      navigator.userAgent ||
      navigator.vendor ||
      (window as unknown as { opera: string }).opera

    if (/android/i.test(userAgent)) {
      setIsAndroid(true)
      setIsMobile(true)
    } else if (
      /iPad|iPhone|iPod/.test(userAgent) &&
      !(window as unknown as { MSStream: boolean }).MSStream
    ) {
      setIsIOS(true)
      setIsMobile(true)
    } else {
      setIsDesktop(true)
    }
  }, [])

  return { isAndroid, isIOS, isMobile, isDesktop }
}

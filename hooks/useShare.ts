import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface ShareData {
  title?: string
  text?: string
  url?: string
}

export function useShare() {
  const [isSharing, setIsSharing] = useState(false)

  const share = useCallback(async (data: ShareData) => {
    setIsSharing(true)

    // Ensure we have a full URL
    const url = data.url || window.location.href

    try {
      // Check for native share support
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: data.title || 'FreeStyla',
          text: data.text || 'Check out this flow!',
          url,
        })
        // Note: successful share promise resolution doesn't guarantee user didn't cancel,
        // but generally means the sheet opened.
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!', { icon: '🔗' })
      }
    } catch (err) {
      // Ignore AbortError (user cancelled)
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err)
        toast.error('Failed to share')
      }
    } finally {
      setIsSharing(false)
    }
  }, [])

  return { share, isSharing }
}

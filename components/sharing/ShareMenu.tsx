'use client'

import { Twitter, Facebook, Link as LinkIcon, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareMenuProps {
  title: string
  text?: string
  url?: string
  audioBlob?: Blob
  onClose: () => void
  className?: string
}

/**
 * Share menu placeholder component
 * TODO: Implement real social sharing in production
 */
export function ShareMenu({ title, text, url, audioBlob, onClose, className }: ShareMenuProps) {
  const handleShare = (platform: string) => {
    // Placeholder - will implement actual sharing in V2
    console.log(`Sharing to ${platform}:`, { title, text, url })
    alert(`Sharing to ${platform} will be implemented in V2`)
    onClose()
  }

  const handleCopyLink = () => {
    // Placeholder - will generate shareable link in V2
    alert('Link sharing will be implemented in V2')
    onClose()
  }

  const handleDownload = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.webm`
      a.click()
      URL.revokeObjectURL(url)
    }
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div
        className={cn(
          'absolute right-0 top-full mt-2 z-50',
          'w-64 rounded-xl border border-text-tertiary/20',
          'bg-background-card backdrop-blur-xl shadow-lg',
          'p-2',
          className
        )}
      >
        <div className="space-y-1">
          <button
            onClick={() => handleShare('twitter')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-background-elevated transition-colors text-left"
          >
            <Twitter size={18} className="text-[#1DA1F2]" />
            <span className="text-text-primary">Share on Twitter</span>
          </button>

          <button
            onClick={() => handleShare('facebook')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-background-elevated transition-colors text-left"
          >
            <Facebook size={18} className="text-[#4267B2]" />
            <span className="text-text-primary">Share on Facebook</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-background-elevated transition-colors text-left"
          >
            <LinkIcon size={18} className="text-text-secondary" />
            <span className="text-text-primary">Copy Link</span>
          </button>

          {audioBlob && (
            <>
              <div className="my-2 border-t border-text-tertiary/10" />
              <button
                onClick={handleDownload}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-background-elevated transition-colors text-left"
              >
                <Download size={18} className="text-accent-orange" />
                <span className="text-text-primary">Download</span>
              </button>
            </>
          )}
        </div>

        <div className="mt-2 pt-2 border-t border-text-tertiary/10">
          <p className="text-text-tertiary text-xs px-3">Social sharing coming in V2</p>
        </div>
      </div>
    </>
  )
}

/**
 * Comment for future implementation:
 *
 * To implement social sharing:
 * 1. Twitter: Use Twitter Web Intent API
 *    - URL: https://twitter.com/intent/tweet?text={text}&url={url}
 *
 * 2. Facebook: Use Facebook Share Dialog
 *    - URL: https://www.facebook.com/sharer/sharer.php?u={url}
 *
 * 3. Instagram: Generate audiogram video from audio + image
 *    - Use Canvas API or server-side video generation
 *    - Provide download for manual upload
 *
 * 4. Native Share API: Use Web Share API when available
 *    - if (navigator.share) { await navigator.share({ title, text, url }) }
 *
 * 5. Generate shareable links:
 *    - Upload audio to GCS
 *    - Create public share URL
 *    - Add Open Graph meta tags for previews
 */

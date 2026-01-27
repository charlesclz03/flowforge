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
  embedded?: boolean
}

/**
 * Share menu placeholder component
 * TODO: Implement real social sharing in production
 */
export function ShareMenu({
  title,
  text,
  url,
  audioBlob,
  onClose,
  className,
  embedded = false,
}: ShareMenuProps) {
  const handleShare = (platform: string) => {
    const shareText = text ? encodeURIComponent(text) : ''
    const shareUrl = url ? encodeURIComponent(url) : ''
    // const shareTitle = title ? encodeURIComponent(title) : '' // unused

    let shareLink = ''

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`
        break
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
        break
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`
        break
      // Add more as needed
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'noopener,noreferrer')
    }
    onClose()
  }

  const handleCopyLink = async () => {
    if (url) {
      try {
        await navigator.clipboard.writeText(url)
        // We'd ideally show a toast here, but ShareMenu doesn't import toast.
        // We can either add it or assume the parent handles feedback,
        // but for a menu component, self-contained feedback is better.
        // Let's rely on the parent or just alert for now?
        // No, let's use toast if possible, or just silent copy.
        // Actually, importing toast is safe here as it's a client component.
      } catch (err) {
        console.error('Failed to copy', err)
      }
    }
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

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'FreeStyla',
          text: text,
          url: url,
        })
        onClose()
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  // Check if native share is available (client-side only)
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <>
      {/* Backdrop - Only show if not embedded */}
      {!embedded && <div className="fixed inset-0 z-40" onClick={onClose} />}

      {/* Menu */}
      <div
        className={cn(
          'z-50',
          embedded
            ? 'relative w-full mt-4 rounded-2xl'
            : 'absolute right-0 top-full mt-2 w-64 rounded-xl shadow-lg',
          'border border-text-tertiary/20',
          'bg-surface-elevated shadow-2xl',
          'p-2',
          className
        )}
      >
        <div className="space-y-1">
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-background-elevated transition-colors text-left"
            >
              <div className="p-1 rounded-full bg-accent-purple/10">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent-purple"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
              <span className="text-text-primary font-medium">
                Share via...
              </span>
            </button>
          )}

          {canNativeShare && (
            <div className="my-1 border-t border-text-tertiary/10" />
          )}

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
          <p className="text-text-tertiary text-xs px-3">
            Social sharing enabled
          </p>
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

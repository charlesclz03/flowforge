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
  const shareData = {
    title: title || 'My FlowForge Session',
    text: text || 'Check out my freestyle flow on FlowForge! 🎤🔥',
    url: url || (typeof window !== 'undefined' ? window.location.href : ''),
  }

  const handleShare = (platform: 'twitter' | 'facebook' | 'tiktok') => {
    const encodedText = encodeURIComponent(shareData.text)
    const encodedUrl = encodeURIComponent(shareData.url)

    if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        '_blank',
        'width=550,height=420'
      )
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        '_blank',
        'width=550,height=420'
      )
    } else if (platform === 'tiktok') {
      // TikTok doesn't support direct web sharing of audio/video without SDK.
      // Best MVP flow: Download file -> Guide user.
      handleDownload()
      alert('Video saved! Open TikTok and upload from your gallery.')
      // Optional: Try deep link
      // window.location.href = 'tiktok://'
    }
    onClose()
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url)
      // Ideally show a toast here, using alert for simple MVP
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
    onClose()
  }

  const handleDownload = () => {
    if (audioBlob) {
      const downloadUrl = URL.createObjectURL(audioBlob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webm`
      a.click()
      URL.revokeObjectURL(downloadUrl)
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
            onClick={() => handleShare('tiktok')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-background-elevated transition-colors text-left"
          >
            {/* Simple Music Icon substitute or specialized SVG if available */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-[18px] h-[18px] text-[#ff0050]"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
            <span className="text-text-primary">Share on TikTok</span>
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
          <p className="text-text-tertiary text-xs px-3">Sharing live!</p>
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

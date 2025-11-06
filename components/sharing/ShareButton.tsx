'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { ShareMenu } from './ShareMenu'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  title: string
  text?: string
  url?: string
  audioBlob?: Blob
  className?: string
}

export function ShareButton({ title, text, url, audioBlob, className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center space-x-2 px-4 py-2 rounded-xl',
          'border border-text-tertiary/20',
          'bg-background-card hover:bg-background-elevated',
          'text-text-primary transition-all',
          className
        )}
      >
        <Share2 size={18} />
        <span>Share</span>
      </button>

      {isOpen && (
        <ShareMenu
          title={title}
          text={text}
          url={url}
          audioBlob={audioBlob}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

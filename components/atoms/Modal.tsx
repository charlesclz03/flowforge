'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 safe-top safe-bottom">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Card */}
      <div
        className={cn(
          'relative w-full max-w-md overflow-hidden rounded-3xl bg-background-elevated border border-stroke-glow shadow-glow transform transition-all animate-in fade-in zoom-in-95 duration-200',
          className
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {title && <h3 className="text-2xl font-bold text-white mb-6 pr-8">{title}</h3>}
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

'use client'

import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  dialogLabel?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  dialogLabel,
  showCloseButton = true,
}: ModalProps & { showCloseButton?: boolean }) {
  const [mounted, setMounted] = useState(false)
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => {
        const focusTarget =
          dialogRef.current?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) ?? dialogRef.current
        focusTarget?.focus()
      })
    } else {
      document.body.style.overflow = 'unset'
      previousFocusRef.current?.focus?.()
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showCloseButton) {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute('aria-hidden'))

      if (focusable.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, showCloseButton])

  if (!mounted || !isOpen) return null

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 safe-top safe-bottom">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={showCloseButton ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? dialogLabel || 'Dialog' : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full max-w-md overflow-hidden rounded-3xl bg-background-elevated border border-stroke-glow shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_28px_90px_rgba(0,0,0,0.58),0_0_42px_rgba(125,122,255,0.14)] transform transition-all animate-in fade-in zoom-in-95 duration-200',
          className
        )}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label={title ? `Close ${title}` : 'Close dialog'}
            className="absolute top-4 right-4 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/20 p-2 text-text-secondary transition-colors hover:bg-black/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-6">
          {title && (
            <h3
              id={titleId}
              className="text-2xl font-bold text-white mb-6 pr-8"
            >
              {title}
            </h3>
          )}
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

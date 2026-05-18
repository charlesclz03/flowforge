'use client'

import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { Star, ThumbsUp } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface RateAppModalProps {
  isOpen: boolean
  onClose: () => void
  onRate: () => void
}

export function RateAppModal({ isOpen, onClose, onRate }: RateAppModalProps) {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const handleRate = () => {
    setIsRedirecting(true)
    onRate() // Set hasRated = true in parent

    // Slight delay for feedback
    setTimeout(() => {
      // In a real TWA, this would be a market:// link or In-App Review
      // For now, redirect to feedback as requested
      router.push('/feedback?mode=rate')
      onClose()
    }, 300)
  }

  const handleFeedback = () => {
    router.push('/feedback')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} dialogLabel="Rate FreeStyla">
      <div className="flex flex-col items-center justify-center text-center p-4 space-y-6">
        {/* Visual Header */}
        <div className="relative">
          <motion.div
            initial={shouldReduceMotion ? false : { scale: 0 }}
            animate={shouldReduceMotion ? undefined : { scale: 1 }}
            transition={
              shouldReduceMotion ? undefined : { type: 'spring', delay: 0.1 }
            }
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30"
          >
            <Star className="w-10 h-10 text-white fill-white" />
          </motion.div>
          <motion.div
            initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={shouldReduceMotion ? undefined : { scale: 1, opacity: 1 }}
            transition={shouldReduceMotion ? undefined : { delay: 0.3 }}
            className="absolute -right-2 -bottom-2 bg-white text-orange-500 rounded-full p-1.5 shadow-md"
          >
            <ThumbsUp size={16} fill="currentColor" />
          </motion.div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">
            Finding Your Flow?
          </h2>
          <p className="text-text-secondary text-sm max-w-[260px] mx-auto">
            If you're enjoying FreeStyla, please take a moment to rate us. It
            helps more artists find the app!
          </p>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <Button
            onClick={handleRate}
            isLoading={isRedirecting}
            className="w-full h-12 text-base font-bold"
          >
            Rate FreeStyla
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-text-tertiary hover:text-white"
          >
            Maybe Later
          </Button>
        </div>

        <div className="pt-2">
          <button
            onClick={handleFeedback}
            className="text-xs text-text-tertiary underline decoration-text-tertiary/30 hover:text-text-secondary transition-colors"
          >
            Report a bug or give feedback
          </button>
        </div>
      </div>
    </Modal>
  )
}

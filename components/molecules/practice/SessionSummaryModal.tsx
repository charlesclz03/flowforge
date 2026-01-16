'use client'

import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { Sparkles, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PostProcessingModal } from './PostProcessingModal'
import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { PWAInstallModal } from '@/components/molecules/pwa/PWAInstallModal'

interface SessionSummaryData {
  score: number
  vibe: string
  description: string
  wordCount: number
  duration: number
  audioUrl?: string
  newBadges?: string[]
  difficulty: string
  bpm: number
  frequency: number
  xp?: {
    gained: number
    newLevel: number
    currentXP: number
    maxXP: number
    breakdown: {
      base: number
      duration: number
      words: number
      achievements: number
    }
  }
  isOptimistic?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Props are valid for client-only components
type SessionSummaryModalProps = {
  data: SessionSummaryData | null
  onClose: () => void
}

export default function SessionSummaryModal({
  data,
  onClose,
}: SessionSummaryModalProps) {
  const [showStudio, setShowStudio] = useState(false)
  const [showPWA, setShowPWA] = useState(false)
  const [step, setStep] = useState(0) // 0: Init, 1: XP Fill, 2: Badges

  // Confetti Effect for New Badges
  useEffect(() => {
    if (data?.newBadges && data.newBadges.length > 0) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7D7AFF', '#FFD700', '#FF00FF'],
        })
      }, 800) // Faster confetti for badge reveal
    }
  }, [data?.newBadges])

  // Sequence Timer (Optimized for snappier reveal)
  useEffect(() => {
    if (!data) return
    const t1 = setTimeout(() => setStep(1), 200) // Start XP fill quickly
    const t2 = setTimeout(() => setStep(2), 1200) // Show Badges sooner
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [data])

  // Intelligent PWA Prompt
  useEffect(() => {
    if (!data) return

    let timer: NodeJS.Timeout
    const isGoodSession =
      data.score > 1000 || (data.newBadges && data.newBadges.length > 0)
    const hasWarned = localStorage.getItem('hasWarnedPWA')

    if (isGoodSession && !hasWarned) {
      timer = setTimeout(() => {
        setShowPWA(true)
        localStorage.setItem('hasWarnedPWA', 'true')
      }, 4000) // Longer delay for animation
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [data])

  if (!data) return null

  if (showStudio && data.audioUrl) {
    return (
      <PostProcessingModal
        audioUrl={data.audioUrl}
        onClose={() => setShowStudio(false)}
        onSave={(_blob) => {}}
      />
    )
  }

  return (
    <Modal isOpen={!!data} onClose={onClose} title="">
      <div className="max-h-[70vh] overflow-y-auto px-1 -mx-1 py-4">
        <div className="space-y-4">
          {/* Animated Header */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="inline-block p-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-neon-gold mb-1"
            >
              <Crown size={32} className="text-white fill-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 uppercase tracking-tighter"
            >
              Session Cleared!
            </motion.h2>
            <p className="text-text-secondary font-medium text-sm">
              {data.description}
            </p>
          </div>

          {/* XP Bar Animation */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            {data.isOptimistic ? (
              <div className="animate-pulse space-y-3">
                <div className="flex justify-between text-xs font-bold text-text-secondary">
                  <div className="h-4 w-16 bg-white/10 rounded"></div>
                  <div className="h-4 w-24 bg-white/10 rounded"></div>
                </div>
                <div className="h-3 bg-white/10 rounded-full w-full"></div>
                <div className="flex justify-end">
                  <div className="h-4 w-20 bg-white/10 rounded"></div>
                </div>
                <div className="text-center text-xs text-text-tertiary mt-1">
                  Syncing Session Data...
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-xs font-bold text-text-secondary mb-2">
                  <span>Level {data.xp?.newLevel || 1}</span>
                  <span>
                    {data.xp?.currentXP || 0} / {data.xp?.maxXP || 1000} XP
                  </span>
                </div>
                <div className="h-3 bg-black/40 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{
                      width: `${Math.max(0, (((data.xp?.currentXP || 0) - (data.xp?.gained || 0)) / (data.xp?.maxXP || 1000)) * 100)}%`,
                    }}
                    animate={{
                      width:
                        step >= 1
                          ? `${((data.xp?.currentXP || 0) / (data.xp?.maxXP || 1000)) * 100}%`
                          : `${Math.max(0, (((data.xp?.currentXP || 0) - (data.xp?.gained || 0)) / (data.xp?.maxXP || 1000)) * 100)}%`,
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-purple to-accent-pink"
                  />
                  {/* Added XP Chunk */}
                  {step >= 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute inset-y-0 left-[0%] w-full bg-white/50 animate-pulse"
                      style={{
                        left: `${Math.max(0, (((data.xp?.currentXP || 0) - (data.xp?.gained || 0)) / (data.xp?.maxXP || 1000)) * 100)}%`,
                        width: `${((data.xp?.gained || 0) / (data.xp?.maxXP || 1000)) * 100}%`,
                      }}
                    />
                  )}
                </div>
                <div className="mt-2 text-right">
                  <span className="text-green-400 font-bold text-xs">
                    +{data.xp?.gained || 0} XP Gained
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Stats Grid - Pop In */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 p-3 rounded-xl text-center border border-white/5"
            >
              <div className="text-2xl font-black text-white">
                {data.wordCount}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                Words
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 p-3 rounded-xl text-center border border-white/5"
            >
              {/* TODO: Replace hardcoded streak with real user data */}
              <div className="text-2xl font-black text-orange-400">🔥 7</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                Consistency Streak
              </div>
            </motion.div>
          </div>

          {/* New Badges Reveal */}
          <AnimatePresence>
            {step >= 2 && data.newBadges && data.newBadges.length > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 border border-accent-purple/50 rounded-2xl p-4 text-center"
              >
                <div className="flex flex-col items-center gap-2">
                  <Sparkles
                    className="text-yellow-300 animate-spin-slow"
                    size={24}
                  />
                  <h3 className="font-bold text-lg text-white">
                    Achievement Unlocked!
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2 mt-1">
                    {data.newBadges.map((badge) => (
                      <span
                        key={badge}
                        className="px-3 py-1 rounded-full bg-accent-purple text-white font-bold text-xs shadow-lg"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={onClose}
              className="w-full max-w-xs bg-white text-black hover:bg-white/90 font-bold"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
      <PWAInstallModal isOpen={showPWA} onClose={() => setShowPWA(false)} />
    </Modal>
  )
}

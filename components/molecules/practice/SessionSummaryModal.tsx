'use client'

import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { useRouter } from 'next/navigation'
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
    breakdown: any
  }
}

type SessionSummaryModalProps = {
  data: SessionSummaryData | null
  onClose: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SessionSummaryModal(props: any) {
  const { data, onClose } = props as SessionSummaryModalProps
  const router = useRouter()
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
      }, 1500) // Delay confetti for badge reveal
    }
  }, [data?.newBadges])

  // Sequence Timer
  useEffect(() => {
    if (!data) return
    const t1 = setTimeout(() => setStep(1), 500) // Start XP fill
    const t2 = setTimeout(() => setStep(2), 2500) // Show Badges
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
    <Modal isOpen={!!data} onClose={onClose} title="VICTORY">
      <div className="space-y-8 py-4">
        {/* Animated Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="inline-block p-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-neon-gold mb-2"
          >
            <Crown size={48} className="text-white fill-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 uppercase tracking-tighter"
          >
            Session Cleared!
          </motion.h2>
          <p className="text-text-secondary font-medium">{data.description}</p>
        </div>

        {/* XP Bar Animation */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex justify-between text-sm font-bold text-text-secondary mb-2">
            <span>Level {data.xp?.newLevel || 1}</span>
            <span>
              {data.xp?.currentXP || 0} / {data.xp?.maxXP || 1000} XP
            </span>
          </div>
          <div className="h-4 bg-black/40 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: `${Math.max(0, (((data.xp?.currentXP || 0) - (data.xp?.gained || 0)) / (data.xp?.maxXP || 1000)) * 100)}%` }}
              animate={{ width: step >= 1 ? `${((data.xp?.currentXP || 0) / (data.xp?.maxXP || 1000)) * 100}%` : `${Math.max(0, (((data.xp?.currentXP || 0) - (data.xp?.gained || 0)) / (data.xp?.maxXP || 1000)) * 100)}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
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
                   width: `${((data.xp?.gained || 0) / (data.xp?.maxXP || 1000)) * 100}%`
                }}
              />
            )}
          </div>
          <div className="mt-2 text-right">
            <span className="text-green-400 font-bold text-sm">
              +{data.xp?.gained || 0} XP Gained
            </span>
          </div>
        </div>

        {/* Stats Grid - Pop In */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 p-4 rounded-xl text-center border border-white/5"
          >
            <div className="text-3xl font-black text-white">
              {data.wordCount}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-text-tertiary">
              Words
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 p-4 rounded-xl text-center border border-white/5"
          >
            {/* Mock Streak until real data integrated */}
            <div className="text-3xl font-black text-orange-400">🔥 7</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
              Consistency Streak: 7 Days. Keep the fire burning.
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
              className="bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 border border-accent-purple/50 rounded-2xl p-6 text-center"
            >
              <div className="flex flex-col items-center gap-2">
                <Sparkles
                  className="text-yellow-300 animate-spin-slow"
                  size={32}
                />
                <h3 className="font-bold text-xl text-white">
                  Legacy Milestone Unlocked:
                </h3>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {data.newBadges.map((badge) => (
                    <span
                      key={badge}
                      className="px-4 py-2 rounded-full bg-accent-purple text-white font-bold text-sm shadow-lg"
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
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => router.push('/recordings')}
            className="w-full max-w-xs bg-white text-black hover:bg-white/90 font-bold"
          >
            Continue
          </Button>
        </div>
      </div>
      <PWAInstallModal isOpen={showPWA} onClose={() => setShowPWA(false)} />
    </Modal>
  )
}

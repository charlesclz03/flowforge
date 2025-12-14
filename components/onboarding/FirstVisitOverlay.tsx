'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, ArrowDown, X } from 'lucide-react'

export function FirstVisitOverlay() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0) // 0: Beat Select, 1: Timer/Play

  useEffect(() => {
    const hasVisited = localStorage.getItem('flowforge_first_visit_complete')
    if (!hasVisited) {
      // Small delay to ensure UI is ready
      setTimeout(() => setShow(true), 1000)
    }
  }, [])

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('flowforge_first_visit_complete', 'true')
  }

  const handleNext = () => {
    if (step === 0) {
      setStep(1)
    } else {
      handleDismiss()
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="beat-select"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 text-center pointer-events-auto"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="bg-accent-purple/20 text-accent-purple px-4 py-2 rounded-full border border-accent-purple/50 backdrop-blur-md">
                Step 1: Choose your Vibe
              </div>
              <h2 className="text-2xl font-bold text-white max-w-xs">
                Select a beat from the library to get started.
              </h2>
              <ArrowDown className="w-10 h-10 text-white animate-bounce" />
              <button
                onClick={handleNext}
                className="mt-4 px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-100"
              >
                Got it
              </button>
            </div>
            {/* Positioning helper: Assuming BeatSelector is roughly in the center/top */}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center pointer-events-auto"
          >
            <div className="flex flex-col items-center gap-4">
              <ArrowDown className="w-10 h-10 text-white animate-bounce rotate-180" />
              <div className="bg-accent-cyan/20 text-accent-cyan px-4 py-2 rounded-full border border-accent-cyan/50 backdrop-blur-md">
                Step 2: Flow
              </div>
              <h2 className="text-2xl font-bold text-white max-w-xs">
                Wait for the ring to fill, then rhyme on the beat.
              </h2>
              <button
                onClick={handleDismiss}
                className="mt-4 px-6 py-2 bg-accent-cyan text-black rounded-full font-bold hover:bg-cyan-400"
              >
                Let's Go
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white pointer-events-auto"
      >
        <X size={24} />
      </button>
    </div>
  )
}

'use client'

import { useEffect, useState, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight } from 'lucide-react'
import { createPortal } from 'react-dom'

interface Step {
  targetId: string
  title: string
  description: string
  placement: 'top' | 'bottom' | 'center'
}

const TOUR_STEPS: Step[] = [
  {
    targetId: 'tour-beat-select',
    title: 'Choose your Vibe',
    description: 'Tap here to select a beat from our curated library.',
    placement: 'bottom',
  },
  {
    targetId: 'tour-word-prompt',
    title: 'Golden Words',
    description: 'Rhyme with these words to boost your flow score!',
    placement: 'bottom',
  },
  {
    targetId: 'tour-record-btn',
    title: 'Start Your Flow',
    description: 'Tap to start the countdown. Good luck!',
    placement: 'top',
  },
]

export function FirstVisitOverlay() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    // Check local storage
    const hasVisited = localStorage.getItem('flowforge_tour_complete')
    if (!hasVisited) {
      // Delay start to allow rendering
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
    return
  }, [])

  // Update rect on step change or resize
  useLayoutEffect(() => {
    if (!isVisible) return

    const updateRect = () => {
      const step = TOUR_STEPS[currentStep]
      const el = document.getElementById(step.targetId)
      if (el) {
        setTargetRect(el.getBoundingClientRect())
        // Scroll element into view if needed
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect)

    // Polling backup for dynamic layout shifts
    const interval = setInterval(updateRect, 500)

    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect)
      clearInterval(interval)
    }
  }, [currentStep, isVisible])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    localStorage.setItem('flowforge_tour_complete', 'true')
  }

  if (!isVisible || typeof window === 'undefined') return null

  // Create Portal to render outside of normal flow (ensure z-index wins)
  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Background Mask - Composed of 4 divs around the target to create "cutout" effect */}
      {targetRect && (
        <>
          {/* Top */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bg-black/70 backdrop-blur-[2px] transition-all duration-300 ease-out"
            style={{ top: 0, left: 0, right: 0, height: targetRect.top }}
          />
          {/* Bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bg-black/70 backdrop-blur-[2px] transition-all duration-300 ease-out"
            style={{ top: targetRect.bottom, left: 0, right: 0, bottom: 0 }}
          />
          {/* Left */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bg-black/70 backdrop-blur-[2px] transition-all duration-300 ease-out"
            style={{
              top: targetRect.top,
              left: 0,
              width: targetRect.left,
              height: targetRect.height,
            }}
          />
          {/* Right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bg-black/70 backdrop-blur-[2px] transition-all duration-300 ease-out"
            style={{
              top: targetRect.top,
              left: targetRect.right,
              right: 0,
              height: targetRect.height,
            }}
          />

          {/* The "Hole" Border/Glow */}
          <motion.div
            className="absolute border-2 border-accent-cyan box-content rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.3)] pointer-events-none transition-all duration-300 ease-out"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
            }}
          />
        </>
      )}

      {/* Tooltip Content */}
      <AnimatePresence mode="wait">
        {targetRect && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute p-4 md:p-6 max-w-xs w-full pointer-events-auto"
            style={{
              // Simple positioning logic
              top:
                TOUR_STEPS[currentStep].placement === 'bottom' ? targetRect.bottom + 16 : undefined,
              bottom:
                TOUR_STEPS[currentStep].placement === 'top'
                  ? window.innerHeight - targetRect.top + 16
                  : undefined,
              left: Math.max(16, targetRect.left + targetRect.width / 2 - 160), // Center but keep padding
            }}
          >
            <div className="bg-[#1a1a1e] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              {/* Decorative Gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-purple to-accent-cyan" />

              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white">{TOUR_STEPS[currentStep].title}</h3>
                <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">
                  {currentStep + 1} / {TOUR_STEPS.length}
                </span>
              </div>

              <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                {TOUR_STEPS[currentStep].description}
              </p>

              <div className="flex justify-between items-center">
                <button
                  onClick={handleComplete}
                  className="text-xs text-text-tertiary hover:text-white transition-colors"
                >
                  Skip Tour
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Close Button (Top Right) */}
      <button
        onClick={handleComplete}
        className="absolute top-4 right-4 p-3 bg-black/40 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors backdrop-blur-md z-[110]"
      >
        <X size={20} />
      </button>
    </div>,
    document.body
  )
}

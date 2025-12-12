'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

export function FirstVisitOverlay() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('flowforge_first_visit_ack')
    if (!hasVisited) {
      // Show after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('flowforge_first_visit_ack', 'true')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center"
        >
          {/* Backdrop with gradient to focus attention */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

          {/* Guide Content */}
          <div className="relative z-10 w-full max-w-7xl px-4 h-full flex flex-col pointer-events-auto">
            {/* Arrow pointing to Beat Selector (Assuming standard layout 3 columns tops) 
                Adjust positioning as needed for responsive layout. 
                For MVP, center-ish attention grabber is safer than specific pixel coordinates.
            */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-[180px] md:mt-[140px] ml-4 md:ml-20 self-start"
            >
              <ArrowDown
                className="text-accent-purple w-16 h-16 animate-bounce"
                strokeWidth={1.5}
              />
              <div className="bg-background-elevated border border-accent-purple/50 p-6 rounded-2xl shadow-glow-purple max-w-sm relative">
                <div className="absolute -top-2 left-6 w-4 h-4 bg-background-elevated border-l border-t border-accent-purple/50 rotate-45" />
                <h3 className="text-xl font-bold text-white mb-2">Start Here</h3>
                <p className="text-text-secondary leading-relaxed">
                  Select a beat to begin your session. The flow starts when you hit play.
                </p>
                <button
                  onClick={handleDismiss}
                  className="mt-4 w-full py-2 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg font-medium transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

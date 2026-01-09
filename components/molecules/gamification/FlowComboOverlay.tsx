'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'

interface FlowComboOverlayProps {
  combo: number
}

export function FlowComboOverlay({ combo }: FlowComboOverlayProps) {
  return (
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-50">
      <AnimatePresence>
        {combo > 1 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            key={combo} // Re-animate on change
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-2">
              <Zap className="text-yellow-400 fill-yellow-400" size={32} />
              <span className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-neon">
                {combo}x
              </span>
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/80 font-bold uppercase tracking-widest text-sm"
            >
              Flow Streak
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

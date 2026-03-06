import { Play, RefreshCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PracticePauseModalProps {
  showPauseModal: boolean
  isPaused: boolean
  setShowPauseModal: (show: boolean) => void
  onTogglePause?: () => void
  handleRestart?: () => void
}

export function PracticePauseModal({
  showPauseModal,
  isPaused,
  setShowPauseModal,
  onTogglePause,
  handleRestart,
}: PracticePauseModalProps) {
  return (
    <AnimatePresence>
      {showPauseModal && isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex items-center gap-6 p-6 rounded-2xl bg-background-elevated/90 border border-white/10 backdrop-blur-xl"
          >
            {/* Resume Button */}
            <button
              onClick={() => {
                setShowPauseModal(false)
                onTogglePause?.()
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-accent-purple/20 border border-accent-purple/30 text-accent-purple hover:bg-accent-purple/30 transition-all"
            >
              <Play size={32} />
              <span className="text-xs font-bold uppercase tracking-widest">
                Resume
              </span>
            </button>
            {/* Restart Button */}
            {handleRestart && (
              <button
                onClick={() => {
                  setShowPauseModal(false)
                  handleRestart()
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                <RefreshCcw size={32} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Restart
                </span>
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

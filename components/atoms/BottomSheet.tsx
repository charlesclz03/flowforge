'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
}

export function BottomSheet({ isOpen, onClose, children, title, className }: BottomSheetProps) {
  const controls = useAnimation()
  
  // Drag logic
  const onDragEnd = async (_: unknown, info: PanInfo) => {
    const shouldClose = info.velocity.y > 20 || (info.velocity.y >= 0 && info.point.y > 45)
    if (shouldClose) {
      await controls.start('hidden')
      onClose()
    } else {
      controls.start('visible')
    }
  }

  useEffect(() => {
    if (isOpen) {
      controls.start('visible')
    } else {
      controls.start('hidden')
    }
  }, [isOpen, controls])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />
          
          {/* Sheet */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            initial="hidden"
            animate={controls}
            exit="hidden"
            variants={{
              visible: { y: 0 },
              hidden: { y: '100%' }
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 bg-background-elevated border-t border-white/10 rounded-t-3xl p-6 z-50 lg:hidden max-h-[85vh] overflow-y-auto",
              className
            )}
            style={{ y: '100%' }} // Start hidden
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            
            {title && (
              <div className="mb-4 text-center">
                 <h3 className="text-lg font-bold text-white">{title}</h3>
              </div>
            )}
            
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

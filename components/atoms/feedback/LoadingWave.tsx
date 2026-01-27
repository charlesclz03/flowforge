'use client'

import { motion } from 'framer-motion'

export const LoadingWave = () => {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-cyan-400 rounded-full"
          animate={{
            height: ['20%', '100%', '20%'],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
          style={{
            height: '20%',
          }}
        />
      ))}
    </div>
  )
}

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface BentoGridProps {
  children: ReactNode
  className?: string
}

interface BentoCardProps {
  children: ReactNode
  className?: string
  title?: string
  icon?: ReactNode
  action?: ReactNode
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
        },
      }}
      className={cn(
        'grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 max-w-7xl mx-auto auto-rows-[minmax(180px,auto)]',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function BentoCard({ children, className, title, icon, action }: BentoCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
            mass: 1,
          },
        },
      }}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/20',
        className
      )}
    >
      {(title || icon || action) && (
        <div className="flex items-center justify-between mb-4 z-10 relative">
          <div className="flex items-center gap-2 text-text-secondary group-hover:text-white transition-colors">
            {icon}
            {title && <span className="text-sm font-medium uppercase tracking-wider">{title}</span>}
          </div>
          {action}
        </div>
      )}
      <div className="relative z-10 flex-1 flex flex-col">{children}</div>

      {/* Background Gradient Blob */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-accent-purple/10 blur-3xl rounded-full group-hover:bg-accent-purple/20 transition-all duration-500" />
    </motion.div>
  )
}

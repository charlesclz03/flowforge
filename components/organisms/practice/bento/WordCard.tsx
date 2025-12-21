'use client'

import { BentoCard } from "@/components/atoms/BentoGrid"
import { Sparkles, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface WordCardProps {
  currentWord: string
  nextWord?: string // Preview feature (future)
  onSkip?: () => void
  isLocked?: boolean
  className?: string
}

export function WordCard({ currentWord, onSkip, className }: WordCardProps) {
  return (
    <BentoCard 
      title="Current Prompt" 
      icon={<Sparkles size={16} className="text-accent-orange" />}
      className={cn("col-span-1 md:col-span-4 lg:col-span-6 min-h-[250px]", className)}
      action={
        onSkip && (
           <button onClick={onSkip} className="p-2 -mr-2 text-text-tertiary hover:text-white transition-colors">
             <RefreshCw size={14} />
           </button>
        )
      }
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord}
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative z-10"
          >
             <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight drop-shadow-2xl">
               {currentWord || "Get Ready"}
             </h2>
          </motion.div>
        </AnimatePresence>
        
        {/* Glow Effect behind word */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[200px] h-[100px] bg-accent-blue/20 blur-[60px] rounded-full pointer-events-none" />
      </div>
    </BentoCard>
  )
}

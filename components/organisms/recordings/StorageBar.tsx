'use client'

import { motion } from 'framer-motion'
import { Cloud, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StorageBarProps {
  usedSeconds: number
  limitSeconds?: number // Default 3600 (1 hour)
  isPro: boolean
  onUpgradeClick: () => void
}

export function StorageBar({
  usedSeconds,
  limitSeconds = 3600,
  isPro,
  onUpgradeClick,
}: StorageBarProps) {
  // Clamp percentage to 100%
  const percentage = Math.min(100, Math.max(0, (usedSeconds / limitSeconds) * 100))
  
  // Formatting helper
  const formatTime = (seconds: number) => {
    const mins = Math.ceil(seconds / 60)
    return `${mins} min`
  }

  return (
    <div 
      onClick={!isPro ? onUpgradeClick : undefined}
      className={cn(
        "w-full space-y-2 mb-6",
        !isPro && "cursor-pointer group"
      )}
    >
      {/* Header Label */}
      <div className="flex justify-between items-end px-1">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Cloud size={16} className={isPro ? "text-accent-purple" : "text-text-tertiary"} />
          Cloud Storage
        </h3>
        <span className="text-xs text-text-tertiary">
          {isPro 
            ? `${formatTime(usedSeconds)} of ${formatTime(limitSeconds)} Used`
            : "Free Plan Limit"
          }
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-6 w-full bg-[#1C1C1E] rounded-lg overflow-hidden border border-white/5">
        {/* Background Track (Gray) */}
        <div className="absolute inset-0 bg-white/5" />

        {/* Fill Bar (Purple) */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${isPro ? percentage : 0}%` }}
          transition={{ duration: 1, ease: 'easeOut' }} // Apple-style smooth fill
          className="absolute inset-y-0 left-0 bg-accent-purple h-full"
        />

        {/* Overlay Text/Content */}
        <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
          {!isPro ? (
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/90 group-hover:text-white transition-colors">
              <Lock size={12} className="text-accent-yellow" />
              <span>Tap to Unlock 1h Storage</span>
            </div>
          ) : (
            // Optional: If we want text inside the bar for Pro users (like "Recordings")
            // matching the screenshot "Backup, Photos, Docs"
            // For now, we leave it clean or add a subtle label if percentage is high enough
            percentage > 10 && (
              <span className="text-[10px] font-bold text-white/50 w-full text-left pl-2">
                Recordings
              </span>
            )
          )}
        </div>
      </div>

      {/* Footer / CTA for Free users (Optional reinforcement) */}
      {!isPro && (
        <p className="text-[10px] text-text-tertiary text-center">
          Pro members get 1 hour of studio-quality cloud storage.
        </p>
      )}
    </div>
  )
}

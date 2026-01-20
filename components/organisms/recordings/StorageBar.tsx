'use client'

import { motion } from 'framer-motion'
import { Cloud, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StorageBarProps {
  usedBytes: number
  limitBytes?: number // Default 100MB
  isPro: boolean
  onUpgradeClick: () => void
}

export function StorageBar({
  usedBytes,
  limitBytes = 100 * 1024 * 1024, // 100 MB default
  isPro,
  onUpgradeClick,
}: StorageBarProps) {
  // Clamp percentage to 100%
  // If limit is 0 (Free user), effectively 100% full immediately
  const percentage =
    limitBytes === 0 ? 100 : Math.min(100, Math.max(0, (usedBytes / limitBytes) * 100))

  return (
    <div
      onClick={!isPro ? onUpgradeClick : undefined}
      className={cn('w-full space-y-2 mb-6', !isPro && 'cursor-pointer group')}
    >
      {/* Header Label */}
      <div className="flex justify-between items-end px-1">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Cloud
            size={16}
            className={isPro ? 'text-accent-purple' : 'text-text-tertiary'}
          />
          Cloud Storage
        </h3>
        <span className="text-xs text-text-tertiary">
          {!isPro ? `${percentage.toFixed(0)}% Used` : 'Unlimited Storage'}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-6 w-full bg-[#1C1C1E] rounded-lg overflow-hidden border border-white/5">
        {/* Background Track (Gray) */}
        <div className="absolute inset-0 bg-white/5" />

        {/* Fill Bar (Purple or Red) */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${isPro ? 0 : percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn(
            'absolute inset-y-0 left-0 h-full',
            percentage >= 100 ? 'bg-red-500' : 'bg-accent-purple'
          )}
        />

        {/* Overlay Text/Content */}
        <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
          {!isPro ? (
            percentage >= 100 ? (
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <Lock size={12} className="text-white" />
                <span>Storage Full</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/90 group-hover:text-white transition-colors">
                <Lock size={12} className="text-accent-yellow" />
                <span>Tap to Unlock</span>
              </div>
            )
          ) : (
            <span className="text-[10px] font-bold text-white/50 w-full text-left pl-2">
              Pro Active
            </span>
          )}
        </div>
      </div>

      {/* Footer / CTA for Free users */}
      {!isPro && (
        <p className="text-[10px] text-text-tertiary text-center">
          {percentage >= 100
            ? 'Delete recordings to free up space or upgrade to Pro.'
            : 'Pro members get unlimited studio-quality cloud storage.'}
        </p>
      )}
    </div>
  )
}

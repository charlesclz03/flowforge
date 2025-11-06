'use client'

import { Zap, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UpgradePromptProps {
  feature?: string
  onUpgrade?: () => void
  onDismiss?: () => void
  className?: string
}

/**
 * Upgrade prompt placeholder component
 * TODO: Implement real Stripe integration in production
 */
export function UpgradePrompt({ feature, onUpgrade, onDismiss, className }: UpgradePromptProps) {
  const handleUpgrade = () => {
    // Placeholder - will integrate Stripe in V2
    alert('Stripe checkout will be implemented in V2')
    if (onUpgrade) onUpgrade()
  }

  return (
    <div className={cn('card p-6 border-accent-orange/20 space-y-4', className)}>
      <div className="flex items-start space-x-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-orange/10 text-accent-orange flex-shrink-0">
          <Zap size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-text-primary">Upgrade to Pro</h3>
          <p className="text-text-secondary text-sm mt-1">
            {feature || 'Unlock unlimited recording and advanced features'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-text-secondary text-sm">
          <Check size={16} className="text-accent-green" />
          <span>Unlimited recording time</span>
        </div>
        <div className="flex items-center space-x-2 text-text-secondary text-sm">
          <Check size={16} className="text-accent-green" />
          <span>100+ premium beats</span>
        </div>
        <div className="flex items-center space-x-2 text-text-secondary text-sm">
          <Check size={16} className="text-accent-green" />
          <span>Ad-free experience</span>
        </div>
        <div className="flex items-center space-x-2 text-text-secondary text-sm">
          <Check size={16} className="text-accent-green" />
          <span>AI scoring (coming soon)</span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleUpgrade}
          className="w-full py-3 rounded-xl bg-accent-orange text-black font-medium transition-all hover:bg-opacity-90"
        >
          Upgrade for $4.99/month
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="w-full py-2 text-text-secondary text-sm hover:text-text-primary transition-colors"
          >
            Maybe later
          </button>
        )}
      </div>

      <p className="text-text-tertiary text-xs text-center">Stripe checkout coming in V2</p>
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'

interface AdBannerProps {
  className?: string
  size?: 'small' | 'medium' | 'large'
}

const sizeClasses = {
  small: 'h-12',
  medium: 'h-20',
  large: 'h-32',
}

/**
 * AdSense placeholder component
 * TODO: Implement real Google AdSense in production
 */
export function AdBanner({ className, size = 'medium' }: AdBannerProps) {
  return (
    <div
      className={cn(
        'w-full rounded-xl border-2 border-dashed border-text-tertiary/20',
        'bg-background-elevated/50',
        'flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      <div className="text-center space-y-1">
        <p className="text-text-tertiary text-xs font-mono">Ad Space</p>
        <p className="text-text-tertiary text-[10px]">Google AdSense will appear here</p>
      </div>
    </div>
  )
}

/**
 * Comment for future implementation:
 * 
 * To implement Google AdSense:
 * 1. Add AdSense script to app/layout.tsx head
 * 2. Get AdSense client ID and add to env
 * 3. Replace this component with actual AdSense code:
 * 
 * <ins className="adsbygoogle"
 *      style={{ display: 'block' }}
 *      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
 *      data-ad-slot="YOUR_AD_SLOT_ID"
 *      data-ad-format="auto"
 *      data-full-width-responsive="true" />
 * 
 * 4. Call (adsbygoogle = window.adsbygoogle || []).push({}) in useEffect
 */


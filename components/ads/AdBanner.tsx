'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface AdBannerProps {
  slot?: string
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  responsive?: boolean
  className?: string
  size?: 'small' | 'medium' | 'large'
}

const sizeClasses = {
  small: 'min-h-[50px]',
  medium: 'min-h-[90px]',
  large: 'min-h-[250px]',
}

/**
 * Google AdSense banner component
 * Shows ads for free-tier users, placeholder when not configured
 */
export function AdBanner({
  slot = '0000000000',
  format = 'auto',
  responsive = true,
  className,
  size = 'medium',
}: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  useEffect(() => {
    if (clientId) {
      try {
        // @ts-expect-error - adsbygoogle is loaded by external script
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (error) {
        console.error('AdSense error:', error)
      }
    }
  }, [clientId])

  // Show placeholder if AdSense not configured
  if (!clientId) {
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

  return (
    <div className={cn('ad-container w-full flex justify-center', sizeClasses[size], className)}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
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

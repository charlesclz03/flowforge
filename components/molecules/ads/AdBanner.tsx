'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useInView } from 'react-intersection-observer'
import { isProUser } from '@/lib/subscription/isPro'

interface AdBannerProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  responsive?: boolean
  className?: string
}

/**
 * Premium AdBanner component that lazy-loads using intersection observer.
 * Automatically hidden for users with "active" or "trialing" subscription marks.
 */
export function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: AdBannerProps) {
  const { data: session } = useSession()
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const [shouldRender, setShouldRender] = useState(false)

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  // Logic to hide for Pro users
  const isPro = isProUser(session?.user)

  useEffect(() => {
    if (inView) {
      setShouldRender(true)
    }
  }, [inView])

  useEffect(() => {
    if (shouldRender && !isPro && clientId) {
      try {
        // @ts-expect-error: adsbygoogle is not defined on window
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (error) {
        console.error('AdSense display error:', error)
      }
    }
  }, [shouldRender, isPro, clientId])

  // Don't render if user is Pro or no client ID or not in view yet
  if (isPro || !clientId) {
    return null
  }

  return (
    <div
      ref={ref}
      className={`ad-container flex justify-center items-center bg-black/20 rounded-lg overflow-hidden min-h-[100px] border border-white/5 ${className}`}
    >
      {shouldRender ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive.toString()}
        />
      ) : (
        <div className="text-[10px] uppercase tracking-widest text-white/20">
          Advertisement
        </div>
      )}
    </div>
  )
}

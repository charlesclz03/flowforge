import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackEvent } from '@/lib/analytics/track'

describe('trackEvent', () => {
  beforeEach(() => {
    window.dataLayer = []
    window.gtag = undefined
  })

  it('pushes to dataLayer when gtag is unavailable', () => {
    trackEvent('howitworks_cta_click', {
      cta: 'start_practice',
      location: 'blueprint',
    })

    expect(window.dataLayer).toEqual([
      {
        event: 'howitworks_cta_click',
        cta: 'start_practice',
        location: 'blueprint',
      },
    ])
  })

  it('prefers gtag when available', () => {
    const gtag = vi.fn()
    window.gtag = gtag

    trackEvent('subscription_activated', {
      source: 'orderconfirmed',
    })

    expect(gtag).toHaveBeenCalledWith('event', 'subscription_activated', {
      source: 'orderconfirmed',
    })
    expect(window.dataLayer).toEqual([])
  })
})

type AnalyticsParams = Record<
  string,
  string | number | boolean | null | undefined
>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
    gtag?: (
      command: 'event',
      eventName: string,
      params?: AnalyticsParams
    ) => void
  }
}

export function trackEvent(
  eventName: string,
  params: AnalyticsParams = {}
): void {
  if (typeof window === 'undefined') return

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
    return
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: eventName,
    ...params,
  })
}

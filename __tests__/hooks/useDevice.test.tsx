import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useDevice } from '@/hooks/useDevice'

function DeviceProbe() {
  const { isIOS, isAndroid, isMobile, isDesktop } = useDevice()

  return (
    <div>
      <span data-testid="ios">{String(isIOS)}</span>
      <span data-testid="android">{String(isAndroid)}</span>
      <span data-testid="mobile">{String(isMobile)}</span>
      <span data-testid="desktop">{String(isDesktop)}</span>
    </div>
  )
}

function setNavigatorValues({
  userAgent,
  platform,
  maxTouchPoints,
}: {
  userAgent: string
  platform: string
  maxTouchPoints: number
}) {
  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    value: userAgent,
  })
  Object.defineProperty(window.navigator, 'platform', {
    configurable: true,
    value: platform,
  })
  Object.defineProperty(window.navigator, 'maxTouchPoints', {
    configurable: true,
    value: maxTouchPoints,
  })
}

const originalNavigator = {
  userAgent: window.navigator.userAgent,
  platform: window.navigator.platform,
  maxTouchPoints: window.navigator.maxTouchPoints,
}

describe('useDevice', () => {
  afterEach(() => {
    setNavigatorValues(originalNavigator)
  })

  it('detects iPadOS devices that report a desktop-class platform', async () => {
    setNavigatorValues({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15',
      platform: 'MacIntel',
      maxTouchPoints: 5,
    })

    render(<DeviceProbe />)

    expect(await screen.findByTestId('ios')).toHaveTextContent('true')
    expect(screen.getByTestId('mobile')).toHaveTextContent('true')
    expect(screen.getByTestId('desktop')).toHaveTextContent('false')
  })
})

import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import HowItWorksPage from '@/app/howitworks/page'
import { getBeats } from '@/lib/db/beats'

vi.mock('@/lib/db/beats', () => ({
  getBeats: vi.fn(),
}))

vi.mock('@/components/organisms/layout/OnboardingLayout', () => ({
  OnboardingLayout: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('@/components/organisms/onboarding/HowItWorksContent', () => ({
  HowItWorksContent: () => null,
}))

describe('/howitworks beat count', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the public tracks inventory count shown by /tracks', async () => {
    vi.mocked(getBeats).mockResolvedValue({
      success: true,
      data: [{ id: 'public-1' }, { id: 'public-2' }, { id: 'public-3' }],
    } as never)

    const page = await HowItWorksPage()
    const content = page.props.children as React.ReactElement<{
      beatCount: number
    }>

    expect(getBeats).toHaveBeenCalledTimes(1)
    expect(content.props.beatCount).toBe(3)
  })
})

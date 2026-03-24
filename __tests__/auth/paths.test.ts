import { describe, it, expect } from 'vitest'
import {
  buildAuthContinuePath,
  buildCompleteProfilePath,
  getDefaultAuthenticatedPath,
  isProfileSetupComplete,
  normalizeInternalPath,
} from '@/lib/auth/paths'

describe('auth paths', () => {
  it('normalizes internal paths and rejects external redirects', () => {
    expect(normalizeInternalPath('/practice')).toBe('/practice')
    expect(normalizeInternalPath('/settings/latency')).toBe('/settings/latency')
    expect(normalizeInternalPath('//evil.example.com')).toBeNull()
    expect(normalizeInternalPath('https://evil.example.com')).toBeNull()
  })

  it('builds auth continue and complete-profile paths with safe defaults', () => {
    expect(buildAuthContinuePath('/recordings')).toBe(
      '/auth/continue?next=%2Frecordings'
    )
    expect(buildAuthContinuePath('https://evil.example.com')).toBe(
      '/auth/continue?next=%2Fpractice'
    )
    expect(buildCompleteProfilePath('/profile')).toBe(
      '/complete-profile?next=%2Fprofile'
    )
  })

  it('detects completed profile setup and chooses the default authenticated path', () => {
    expect(isProfileSetupComplete(null)).toBe(false)
    expect(isProfileSetupComplete({ profileSetupCompletedAt: null })).toBe(false)
    expect(
      isProfileSetupComplete({
        profileSetupCompletedAt: '2026-03-24T10:00:00.000Z',
      })
    ).toBe(true)

    expect(getDefaultAuthenticatedPath({ username: 'artist' })).toBe('/u/artist')
    expect(getDefaultAuthenticatedPath({})).toBe('/practice')
  })
})

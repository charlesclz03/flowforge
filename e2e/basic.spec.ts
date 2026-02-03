import { test, expect } from '@playwright/test'

test('visitor lands on onboarding blueprint', async ({ page }) => {
  await page.goto('/howitworks')
  await expect(page).toHaveURL(/\/howitworks/)
  await expect(page).toHaveTitle(/Blueprint/i)
  await expect(page.getByRole('heading', { name: 'THE BLUEPRINT' })).toBeVisible()
})

test('visitor can open the Beat Vault', async ({ page }) => {
  await page.goto('/tracks')
  await expect(page.getByText('Beat Vault')).toBeVisible()
})

// Note: Testing actual recording requires AudioContext mocking or browser flags,
// usually better done with manual verification for this MVP phase.

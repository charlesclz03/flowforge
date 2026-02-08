import { test, expect } from '@playwright/test'

test.beforeEach(async ({}, testInfo) => {
  test.skip(
    !testInfo.project.name.includes('mobile'),
    'Mobile checks run only on mobile projects'
  )
})

test('mobile nav and primary routes are reachable', async ({ page }) => {
  await page.goto('/howitworks')
  await expect(page.getByRole('link', { name: 'Beats' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible()

  await page.getByRole('link', { name: 'Beats' }).click()
  await expect(page).toHaveURL(/\/tracks/, { timeout: 15000 })
  await expect(page.getByText('Beat Vault')).toBeVisible()
})

test('mobile practice can start without stuck loader', async ({ page }) => {
  await page.goto('/practice')

  const startButton = page.locator('#tour-record-btn')
  await expect(startButton).toBeVisible({ timeout: 15000 })
  await startButton.click({ force: true })

  await expect(startButton).not.toContainText(/START/i, { timeout: 15000 })
})

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
  await expect(
    page.getByRole('link', { name: 'Record', exact: true })
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible()

  await page.goto('/tracks')
  await expect(page.getByRole('link', { name: 'Beats' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Beat Vault' })).toBeVisible()
})

test('mobile practice can start without stuck loader', async ({ page }) => {
  await page.goto('/practice')

  const startButton = page.locator('#tour-record-btn')
  await expect(startButton).toBeVisible({ timeout: 15000 })
  await startButton.click({ force: true })

  await expect(startButton).not.toContainText(/START/i, { timeout: 15000 })
})

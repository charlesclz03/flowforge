import { test, expect } from '@playwright/test'

test('practice page is startable (no stuck loader)', async ({ page }) => {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => pageErrors.push(err.message))

  await page.goto('/practice')

  const startButton = page.locator('#tour-record-btn')
  await expect(startButton).toBeVisible({ timeout: 15_000 })
  await expect(startButton).toContainText(/START/i)

  await startButton.click({ force: true })

  // Once started, the Pause button becomes available.
  await expect(page.getByRole('button', { name: 'Pause Session' })).toBeVisible({
    timeout: 15_000,
  })

  // Guardrail: no CSP violations or uncaught exceptions during the smoke path.
  expect(pageErrors).toEqual([])
  expect(consoleErrors.filter((e) => /content security policy/i.test(e))).toEqual(
    []
  )
})

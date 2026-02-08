import { test, expect, type Locator } from '@playwright/test'

async function ensureSessionStarted(startButton: Locator) {
  for (let attempt = 0; attempt < 4; attempt++) {
    await startButton.click({ force: true })

    try {
      await expect(startButton).not.toContainText(/START/i, { timeout: 5000 })
      return
    } catch {
      // Retry; browser autoplay/user-gesture timing can be flaky in CI/headless.
    }
  }

  // Final assertion for clean failure signal.
  await expect(startButton).not.toContainText(/START/i, { timeout: 5000 })
}

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

  await ensureSessionStarted(startButton)

  // Guardrail: no CSP violations or uncaught exceptions during the smoke path.
  expect(pageErrors).toEqual([])
  expect(consoleErrors.filter((e) => /content security policy/i.test(e))).toEqual(
    []
  )
})

test('session auto-finishes at configured timeout and returns to ready state', async ({
  page,
}) => {
  const unauthorizedSessionCalls: string[] = []
  page.on('response', (res) => {
    const url = res.url()
    if (
      res.status() === 401 &&
      (url.includes('/api/recordings') || url.includes('/api/session/complete'))
    ) {
      unauthorizedSessionCalls.push(url)
    }
  })

  await page.goto('/practice')

  const startButton = page.locator('#tour-record-btn')
  await expect(startButton).toBeVisible({ timeout: 15_000 })
  await ensureSessionStarted(startButton)

  // Playwright webServer sets NEXT_PUBLIC_SESSION_DURATION_SECONDS=15 for local E2E.
  await expect(startButton).toContainText(/START/i, { timeout: 40_000 })
  expect(unauthorizedSessionCalls).toEqual([])
})

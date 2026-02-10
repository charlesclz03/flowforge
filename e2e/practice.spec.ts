import { test, expect, type Page } from '@playwright/test'

async function ensureSessionPlaying(page: Page) {
  const startButton = page.locator('#tour-record-btn')
  const pauseButton = page.getByRole('button', { name: /pause session/i })

  for (let attempt = 0; attempt < 4; attempt++) {
    await startButton.click({ force: true })

    try {
      await expect(pauseButton).toBeVisible({ timeout: 20_000 })
      return
    } catch {
      // Retry; browser autoplay/user-gesture timing can be flaky in CI/headless.
    }
  }

  // Final assertion for clean failure signal.
  await expect(pauseButton).toBeVisible({ timeout: 20_000 })
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

  await ensureSessionPlaying(page)

  // Guardrail: no CSP violations or uncaught exceptions during the smoke path.
  expect(pageErrors).toEqual([])
  expect(consoleErrors.filter((e) => /content security policy/i.test(e))).toEqual(
    []
  )
})

test('session auto-finishes at configured timeout and returns to ready state', async ({
  page,
}) => {
  test.setTimeout(90_000)

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
  await ensureSessionPlaying(page)

  // Playwright webServer sets NEXT_PUBLIC_SESSION_DURATION_SECONDS=15 for local E2E.
  await expect(startButton).toContainText(/START/i, { timeout: 40_000 })
  expect(unauthorizedSessionCalls).toEqual([])
})

test('pause/resume does not reset the current word', async ({ page }) => {
  await page.goto('/practice')

  const frequencyPill = page.locator('[data-testid="practice-frequency-pill"]')
  await expect(frequencyPill).toBeVisible({ timeout: 15_000 })

  // Make word cycles long so natural word changes don't flake the assertion.
  await frequencyPill.click() // 4 -> 8
  await frequencyPill.click() // 8 -> 16
  await expect(frequencyPill).toContainText(/16\s+Bars/i)

  const startButton = page.locator('#tour-record-btn')
  await expect(startButton).toBeVisible({ timeout: 15_000 })
  await ensureSessionPlaying(page)

  const word = page.locator('[data-testid="practice-word"]')
  await expect(word).toBeVisible({ timeout: 15_000 })
  const before = (await word.textContent())?.trim()
  expect(before).toBeTruthy()

  const pauseButton = page.getByRole('button', { name: /pause session/i })
  await expect(pauseButton).toBeVisible({ timeout: 15_000 })
  await pauseButton.click()

  const resumeButton = page.getByRole('button', { name: /resume/i })
  await expect(resumeButton).toBeVisible({ timeout: 15_000 })
  await resumeButton.click()

  await page.waitForTimeout(500)
  const after = (await word.textContent())?.trim()
  expect(after).toBe(before)
})

test('difficulty/frequency changes show as pending during an active session', async ({
  page,
}) => {
  await page.goto('/practice')

  await ensureSessionPlaying(page)

  const difficultyPill = page.locator(
    '[data-testid="practice-difficulty-pill"]'
  )
  const frequencyPill = page.locator('[data-testid="practice-frequency-pill"]')

  await expect(difficultyPill).toBeVisible({ timeout: 15_000 })
  await expect(frequencyPill).toBeVisible({ timeout: 15_000 })

  await difficultyPill.click()
  await expect(difficultyPill).toHaveAttribute('title', /Hard/i)

  await frequencyPill.click()
  await expect(frequencyPill).toHaveAttribute('title', /8/i)
})

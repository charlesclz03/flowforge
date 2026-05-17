import { test, expect } from '@playwright/test'

test('visitor landing redirects to onboarding blueprint', async ({ page }) => {
  await page.goto('/')
  // In dev mode the client redirect can lag while the route compiles.
  await expect(page).toHaveURL(/\/howitworks/, { timeout: 15000 })
  await expect(page).toHaveTitle(/Blueprint/i)
  await expect(
    page.getByRole('heading', { name: 'THE BLUEPRINT' })
  ).toBeVisible()
})

test('visitor can open the Beat Vault', async ({ page }) => {
  await page.goto('/tracks')
  await expect(page.getByRole('heading', { name: 'Beat Vault' })).toBeVisible()
})

test('guest does not trigger unauthorized user-beats fetch on /tracks', async ({
  page,
}) => {
  const unauthorizedUserBeatCalls: string[] = []

  page.on('response', (res) => {
    const url = res.url()
    if (res.status() === 401 && url.includes('/api/user/beats')) {
      unauthorizedUserBeatCalls.push(url)
    }
  })

  await page.goto('/tracks')
  await expect(page.getByRole('heading', { name: 'Beat Vault' })).toBeVisible()
  await page.waitForTimeout(1000)

  expect(unauthorizedUserBeatCalls).toEqual([])
})

test('guest is redirected away from protected profile route', async ({
  page,
}) => {
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fprofile/, {
    timeout: 15000,
  })
})

test('guest is redirected away from recordings route', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/recordings', {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  })
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Frecordings/, {
    timeout: 15000,
  })
})

test('guest callback to latency settings resolves to blueprint (no home loop)', async ({
  page,
}) => {
  await page.goto('/?callbackUrl=%2Fsettings%2Flatency')
  await expect(page).toHaveURL(
    /\/howitworks\?callbackUrl=%2Fsettings%2Flatency/,
    {
      timeout: 15000,
    }
  )
  await expect(
    page.getByRole('heading', { name: 'THE BLUEPRINT' })
  ).toBeVisible()
})

test('guest direct latency settings access preserves callback intent', async ({
  page,
}) => {
  await page.goto('/settings/latency')
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fsettings%2Flatency/, {
    timeout: 20000,
  })
})

test('guest review deep link never renders blank', async ({ page }) => {
  await page.goto('/review/fake-audit-id')
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible({
    timeout: 15000,
  })
  await expect(page).toHaveURL(
    /\/login\?callbackUrl=%2Freview%2Ffake-audit-id/,
    {
      timeout: 15000,
    }
  )
})

test('feedback controls expose accessible labels', async ({ page }) => {
  await page.goto('/feedback')
  await expect(page.getByRole('radio', { name: '1 star' })).toBeVisible()
  await expect(page.getByRole('radio', { name: '5 stars' })).toBeVisible()
  await expect(page.getByLabel('Feedback')).toBeVisible()
})

test('patch notes render without duplicate-key console errors', async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  await page.goto('/patch-notes')
  await expect(page.getByRole('heading', { name: 'PATCH NOTES' })).toBeVisible()
  expect(
    consoleErrors.filter((message) =>
      /encountered two children with the same key/i.test(message)
    )
  ).toEqual([])
})

test('visitor sees 404 on unknown route', async ({ page }) => {
  await page.goto('/this-route-does-not-exist')
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
  await expect(page.getByText('Page not found')).toBeVisible()
})

// Note: Testing actual recording requires AudioContext mocking or browser flags,
// usually better done with manual verification for this MVP phase.

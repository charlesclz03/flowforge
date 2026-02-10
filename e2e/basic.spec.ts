import { test, expect } from '@playwright/test'

test('visitor landing redirects to onboarding blueprint', async ({ page }) => {
  await page.goto('/')
  // In dev mode the client redirect can lag while the route compiles.
  await expect(page).toHaveURL(/\/howitworks/, { timeout: 15000 })
  await expect(page).toHaveTitle(/Blueprint/i)
  await expect(page.getByRole('heading', { name: 'THE BLUEPRINT' })).toBeVisible()
})

test('visitor can open the Beat Vault', async ({ page }) => {
  await page.goto('/tracks')
  await expect(page.getByText('Beat Vault')).toBeVisible()
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
  await expect(page.getByText('Beat Vault')).toBeVisible()
  await page.waitForTimeout(1000)

  expect(unauthorizedUserBeatCalls).toEqual([])
})

test('guest is redirected away from protected profile route', async ({ page }) => {
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/howitworks/, { timeout: 15000 })
})

test('guest is redirected away from recordings route', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/recordings', {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  })
  await expect(page).toHaveURL(/\/howitworks/, { timeout: 15000 })
})

test('visitor sees 404 on unknown route', async ({ page }) => {
  await page.goto('/this-route-does-not-exist')
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
  await expect(page.getByText('Page not found')).toBeVisible()
})

// Note: Testing actual recording requires AudioContext mocking or browser flags,
// usually better done with manual verification for this MVP phase.

import { expect, test, type Page } from '@playwright/test'
import { createPlaywrightSession } from './helpers/auth'

function luminance([r, g, b]: number[]) {
  const channels = [r, g, b].map((value) => {
    const normalized = value / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4)
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function contrastRatio(foreground: number[], background: number[]) {
  const fg = luminance(foreground)
  const bg = luminance(background)
  const lighter = Math.max(fg, bg)
  const darker = Math.min(fg, bg)
  return (lighter + 0.05) / (darker + 0.05)
}

async function rgbFor(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((element) => {
      const styles = window.getComputedStyle(element)
      const parse = (value: string) =>
        value
          .match(/\d+(\.\d+)?/g)
          ?.slice(0, 3)
          .map(Number) ?? [0, 0, 0]

      return {
        color: parse(styles.color),
        backgroundColor: parse(styles.backgroundColor),
      }
    })
}

async function expectNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement
    return {
      overflow: doc.scrollWidth - doc.clientWidth,
      clippedActions: Array.from(
        document.querySelectorAll('button, a, [role="button"]')
      ).filter(
        (element) =>
          element.clientWidth > 0 &&
          element.scrollWidth > element.clientWidth + 2
      ).length,
    }
  })

  expect(metrics.overflow).toBeLessThanOrEqual(2)
  expect(metrics.clippedActions).toBe(0)
}

const mockBeat = {
  id: 'pw-beat-1',
  title: 'Mock Audit Beat',
  bpm: 92,
  storageUrl: 'https://example.test/beat.mp3',
  coverImage: null,
  isPremium: false,
  genre: 'Hip-Hop',
  artistName: 'PW Producer',
}

const mockAudioRecording = {
  id: 'pw-audio-review',
  title: 'Audio Review Take',
  beatId: mockBeat.id,
  beat: mockBeat,
  storageUrl: 'https://example.test/audio.wav',
  audioStatus: 'ready',
  durationSeconds: 76,
  wordCount: 64,
  difficulty: 2,
  beatOffsetMs: 0,
  fxConfig: null,
  createdAt: '2026-05-18T12:00:00.000Z',
}

const mockStatsOnlyRecording = {
  ...mockAudioRecording,
  id: 'pw-stats-only',
  title: 'Stats Only Take',
  storageUrl: null,
  audioStatus: 'stats-only',
}

test.describe('enterprise UI remediation regressions', () => {
  test('primary feedback CTA keeps WCAG AA contrast', async ({ page }) => {
    await page.goto('/feedback')

    const styles = await rgbFor(page, 'button:has-text("Send Feedback")')
    expect(
      contrastRatio(styles.color, styles.backgroundColor)
    ).toBeGreaterThanOrEqual(4.5)
  })

  test('mobile bottom nav exposes visible destination labels', async ({
    page,
  }, testInfo) => {
    test.skip(
      !testInfo.project.name.includes('mobile'),
      'Mobile nav label checks run only on mobile projects'
    )

    await page.goto('/tracks')

    for (const label of [
      'Beats',
      'Trophy',
      'Record',
      'Recordings',
      'Profile',
    ]) {
      await expect(
        page.getByRole('link', { name: label, exact: true })
      ).toBeVisible()
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
  })

  test('locked beat upgrade modal has dialog semantics', async ({ page }) => {
    await page.goto('/tracks')

    await page
      .getByRole('button', { name: /new beat requires freestyla pro/i })
      .click()

    await expect(
      page.getByRole('dialog', { name: /secret beat vault/i })
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('reduced motion preference flattens practice CTA animation', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/practice')

    const transform = await page
      .locator('#tour-record-btn')
      .evaluate((element) => {
        return window.getComputedStyle(element).transform
      })

    expect(transform === 'none' || transform.includes('matrix(1')).toBeTruthy()
  })

  test('public funnel CTAs stay visible without horizontal overflow', async ({
    page,
  }) => {
    for (const route of [
      '/howitworks',
      '/pricing',
      '/download',
      '/login',
      '/signup',
    ]) {
      await page.goto(route)
      await expect(page.locator('body')).toBeVisible()
      await expectNoHorizontalOverflow(page)
      await expect(
        page
          .locator('a, button')
          .filter({ hasText: /start|sign|launch|install|get|continue/i })
          .first()
      ).toBeVisible()
    }
  })

  test('offline retry and legal pages use stable enterprise surfaces', async ({
    page,
  }) => {
    await page.goto('/offline')
    await expect(
      page.getByRole('button', { name: /retry connection/i })
    ).toBeVisible()
    await expectNoHorizontalOverflow(page)

    await page.goto('/legal')
    await expect(
      page.getByRole('link', { name: /terms of service/i })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /privacy policy/i })
    ).toBeVisible()
    await expectNoHorizontalOverflow(page)

    await page.goto('/legal/privacy')
    const articleWidth = await page
      .locator('article')
      .evaluate((element) => element.getBoundingClientRect().width)
    expect(articleWidth).toBeLessThanOrEqual(920)
  })

  test('stable trust surfaces match visual baselines', async ({ page }) => {
    await page.goto('/offline')
    await expect(page).toHaveScreenshot('offline-trust-surface.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    })

    await page.goto('/legal')
    await expect(page).toHaveScreenshot('legal-index-surface.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    })
  })

  test('admin guest redirect preserves callback intent', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin/, {
      timeout: 15_000,
    })
  })

  test('superadmin dashboard and feedback cards render with safe mocked data', async ({
    page,
  }) => {
    let session: Awaited<ReturnType<typeof createPlaywrightSession>> | null =
      null
    try {
      session = await createPlaywrightSession(page, 'superadmin')
    } catch {
      test.skip(
        true,
        'DATABASE_URL is required for database-backed admin session coverage'
      )
    }

    await page.route('**/api/feedback', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue()
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          feedbacks: [
            {
              id: 'pw-feedback-1',
              content: 'Mocked feedback for enterprise UI audit coverage.',
              createdAt: '2026-05-18T12:00:00.000Z',
              user: {
                name: 'Playwright Admin',
                email: 'pw-admin@example.com',
                image: null,
              },
            },
          ],
        }),
      })
    })

    try {
      await page.goto('/admin')
      await expect(
        page.getByRole('link', { name: /upload beat/i })
      ).toBeVisible()
      await expect(
        page.getByRole('link', { name: /manage library/i })
      ).toBeVisible()
      await expectNoHorizontalOverflow(page)

      await page.goto('/admin/feedback')
      await expect(
        page.getByText('Mocked feedback for enterprise UI audit coverage.')
      ).toBeVisible()
      await expectNoHorizontalOverflow(page)
    } finally {
      await session?.cleanup()
    }
  })

  test('recordings and review states avoid audio-only actions for stats-only data', async ({
    page,
  }) => {
    let session: Awaited<ReturnType<typeof createPlaywrightSession>> | null =
      null
    try {
      session = await createPlaywrightSession(page, 'pro')
    } catch {
      test.skip(
        true,
        'DATABASE_URL is required for database-backed recordings coverage'
      )
    }

    await page.route(
      '**/api/recordings?includeMetadata=true',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            recordings: [mockStatsOnlyRecording, mockAudioRecording],
          }),
        })
      }
    )

    await page.route('**/api/recordings/pw-stats-only', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ recording: mockStatsOnlyRecording }),
      })
    })

    try {
      await page.goto('/recordings')
      await expect(page.getByText('Stats-Only (No Mic)')).toBeVisible()
      await expect(
        page.getByRole('link', { name: /audio review take/i })
      ).toBeVisible()
      await expect(
        page.getByRole('link', { name: /stats only take/i })
      ).toHaveCount(0)
      await expectNoHorizontalOverflow(page)

      await page.goto('/review/pw-stats-only')
      await expect(
        page.getByText('No audio was captured for this session')
      ).toBeVisible()
      await expect(
        page.getByRole('button', { name: /^download$/i })
      ).toHaveCount(0)
    } finally {
      await session?.cleanup()
    }
  })

  test('latency calibration slider remains keyboard reachable', async ({
    page,
  }) => {
    let session: Awaited<ReturnType<typeof createPlaywrightSession>> | null =
      null
    try {
      session = await createPlaywrightSession(page, 'free')
    } catch {
      test.skip(
        true,
        'DATABASE_URL is required for database-backed latency settings coverage'
      )
    }

    try {
      await page.goto('/settings/latency')
      await expect(
        page.getByRole('slider', { name: /latency adjustment/i })
      ).toBeVisible({ timeout: 20_000 })
      await page.getByRole('slider', { name: /latency adjustment/i }).focus()
      await page.keyboard.press('ArrowRight')
      await expectNoHorizontalOverflow(page)
    } finally {
      await session?.cleanup()
    }
  })
})

import { expect, test, type Locator, type Page } from '@playwright/test'

const SMALL_IPHONE = { width: 375, height: 667 }
const EXPECTED_PLAYER_COLORS = ['#A855F7', '#F97316', '#FFD60A', '#30D158']

async function primePracticeState(
  page: Page,
  overrides: Record<string, unknown> = {}
) {
  await page.addInitScript((state) => {
    window.localStorage.setItem(
      'flowforge_session_state',
      JSON.stringify({
        selectedBeat: null,
        frequency: 4,
        difficulty: 2,
        isTTSEnabled: true,
        ttsVolume: 0.5,
        mode: 'solo',
        cypherPlayers: 2,
        isRecordingEnabled: false,
        isStudioFXEnabled: true,
        beatVolume: 0.7,
        selectedLanguage: 'en-US',
        ...state,
      })
    )
  }, overrides)
}

async function loadPractice(
  page: Page,
  overrides: Record<string, unknown> = {}
) {
  await page.setViewportSize(SMALL_IPHONE)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await primePracticeState(page, overrides)
  await page.goto('/practice')
  await page.locator('#tour-record-btn').waitFor({ state: 'visible' })
  await expect(page.locator('#tour-record-btn')).toBeEnabled({
    timeout: 15_000,
  })
  if (overrides.mode === 'cypher') {
    await expect(page.getByTestId('practice-orb-frame')).toHaveAttribute(
      'data-cypher-player-color',
      EXPECTED_PLAYER_COLORS[0],
      { timeout: 10_000 }
    )
  }
}

async function startPractice(page: Page) {
  const startButton = page.locator('#tour-record-btn')
  const box = await startButton.boundingBox()
  expect(box).not.toBeNull()
  await page.touchscreen.tap(
    (box?.x ?? 0) + (box?.width ?? 0) / 2,
    (box?.y ?? 0) + (box?.height ?? 0) / 2
  )
  await expect(startButton).toBeVisible()
}

async function expectSquare(locator: Locator, tolerance = 1.5) {
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  expect(Math.abs((box?.width ?? 0) - (box?.height ?? 0))).toBeLessThanOrEqual(
    tolerance
  )
}

async function expectConcentric(outer: Locator, inner: Locator, tolerance = 4) {
  const outerBox = await outer.boundingBox()
  const innerBox = await inner.boundingBox()
  expect(outerBox).not.toBeNull()
  expect(innerBox).not.toBeNull()

  const outerCenter = {
    x: (outerBox?.x ?? 0) + (outerBox?.width ?? 0) / 2,
    y: (outerBox?.y ?? 0) + (outerBox?.height ?? 0) / 2,
  }
  const innerCenter = {
    x: (innerBox?.x ?? 0) + (innerBox?.width ?? 0) / 2,
    y: (innerBox?.y ?? 0) + (innerBox?.height ?? 0) / 2,
  }

  expect(Math.abs(outerCenter.x - innerCenter.x)).toBeLessThanOrEqual(tolerance)
  expect(Math.abs(outerCenter.y - innerCenter.y)).toBeLessThanOrEqual(tolerance)
}

async function expectNoVerticalOverlap(upper: Locator, lower: Locator) {
  const upperBox = await upper.boundingBox()
  const lowerBox = await lower.boundingBox()
  expect(upperBox).not.toBeNull()
  expect(lowerBox).not.toBeNull()
  expect((upperBox?.y ?? 0) + (upperBox?.height ?? 0)).toBeLessThanOrEqual(
    (lowerBox?.y ?? 0) + 1
  )
}

test.describe('Practice 2026 pro-grade visual guardrails', () => {
  test.setTimeout(60_000)

  test('solo practice keeps the player a true circle on small iPhone', async ({
    page,
  }) => {
    await loadPractice(page)
    await page.screenshot({
      path: 'artifacts/practice-solo-idle-iphone-se.png',
    })

    const orbFrame = page.getByTestId('practice-orb-frame')
    const orb = page.locator('#tour-record-btn')
    const timerRing = page.getByTestId('practice-timer-ring')

    await expectSquare(orbFrame)
    await expectSquare(orb)
    await expectConcentric(orb, timerRing)
  })

  test('solo countdown, playing, paused, and siren states stay non-overlapping', async ({
    page,
  }) => {
    await loadPractice(page)
    await startPractice(page)
    await page.screenshot({
      path: 'artifacts/practice-solo-countdown-iphone-se.png',
    })

    const header = page.locator('header')
    const topControls = page.locator('.practice-top-controls')
    const orb = page.locator('#tour-record-btn')
    const recordControl = page.locator('.practice-record-area')

    await expectNoVerticalOverlap(header, topControls)
    await expectNoVerticalOverlap(topControls, orb)
    await expectNoVerticalOverlap(orb, recordControl)

    await page.waitForTimeout(3600)
    await page.screenshot({
      path: 'artifacts/practice-solo-playing-iphone-se.png',
    })
    await expectNoVerticalOverlap(topControls, orb)
    await expectNoVerticalOverlap(orb, recordControl)

    const pauseButton = page.getByRole('button', { name: /pause session/i })
    if (await pauseButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pauseButton.evaluate((button) => {
        ;(button as HTMLButtonElement).click()
      })
      await page.screenshot({
        path: 'artifacts/practice-solo-paused-iphone-se.png',
      })
      await expect(page.getByRole('dialog')).toBeVisible()
    }

    await page.evaluate(() => {
      document.documentElement.dataset.visualSirenProbe = 'true'
    })
    await page.screenshot({
      path: 'artifacts/practice-solo-siren-probe-iphone-se.png',
    })
  })

  for (const players of [2, 3, 4]) {
    test(`cypher mode renders ${players} player ring segments with active-player tint`, async ({
      page,
    }) => {
      await loadPractice(page, { mode: 'cypher', cypherPlayers: players })
      await startPractice(page)

      const orb = page.locator('#tour-record-btn')
      const cypherRing = page.getByTestId('cypher-ring')
      const segments = page.getByTestId('cypher-ring-segment')
      const visualizer = page.getByTestId('practice-visualizer')
      const glow = page.getByTestId('practice-player-glow')

      await expect(cypherRing).toBeVisible()
      await expect(segments).toHaveCount(players)
      await expectConcentric(orb, cypherRing, 6)
      await expectSquare(orb)

      const visibleSegmentColors = await segments.evaluateAll((nodes) =>
        nodes.map((node) => ({
          stroke: node.getAttribute('stroke'),
          width: Number(node.getAttribute('stroke-width') || 0),
          opacity: Number(window.getComputedStyle(node).opacity || 0),
        }))
      )

      for (const color of EXPECTED_PLAYER_COLORS.slice(0, players)) {
        expect(
          visibleSegmentColors.some((segment) => segment.stroke === color)
        ).toBeTruthy()
      }
      expect(
        visibleSegmentColors.every((segment) => segment.opacity > 0)
      ).toBeTruthy()

      await expect(visualizer).toHaveAttribute(
        'data-visualizer-color',
        EXPECTED_PLAYER_COLORS[0]
      )
      await expect(glow).toHaveAttribute('style', /168,\s*85,\s*247/)
      await page.screenshot({
        path: `artifacts/practice-cypher-${players}p-iphone-se.png`,
      })
    })
  }

  test('AppHeader remains touch-safe and unclipped on core surfaces', async ({
    page,
  }) => {
    await page.setViewportSize(SMALL_IPHONE)
    await page.emulateMedia({ reducedMotion: 'reduce' })

    for (const route of [
      '/howitworks',
      '/difficultyselection',
      '/practice',
      '/tracks',
      '/recordings',
      '/settings/latency',
      '/admin',
    ]) {
      await page.goto(route, { waitUntil: 'commit' }).catch((error) => {
        if (!String(error).includes('interrupted by another navigation')) {
          throw error
        }
      })
      await page.waitForLoadState('domcontentloaded').catch(() => undefined)
      const header = page.locator('header')
      await expect(header).toBeVisible()

      const box = await header.boundingBox()
      expect(box).not.toBeNull()
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(64)

      const controls = header.locator('a, button')
      const count = await controls.count()
      for (let index = 0; index < count; index += 1) {
        const controlBox = await controls.nth(index).boundingBox()
        if (!controlBox) continue
        expect(controlBox.height).toBeGreaterThanOrEqual(40)
        expect(controlBox.y).toBeGreaterThanOrEqual((box?.y ?? 0) - 2)
        expect(controlBox.y + controlBox.height).toBeLessThanOrEqual(
          (box?.y ?? 0) + (box?.height ?? 0) + 1
        )
      }
    }
  })
})

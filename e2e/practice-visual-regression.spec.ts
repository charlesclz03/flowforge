import { expect, test, type Locator, type Page } from '@playwright/test'

const SMALL_IPHONE = { width: 375, height: 667 }
const EXPECTED_PLAYER_COLORS = ['#A855F7', '#F97316', '#FFD60A', '#30D158']
const LOCAL_TEST_BEAT = {
  id: 'visual-local-shotgun-boom',
  title: 'So Fresh Without You',
  bpm: 155,
  storageUrl: '/beats/Shotgun-Boom.mp3',
  isPremium: false,
  artistName: 'FreeStyla Visual',
  genre: 'Boom Bap',
  duration: 120,
  tags: ['visual-regression'],
}

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

async function mockPlayableAudio(page: Page) {
  await page.addInitScript(() => {
    const originalFetch: typeof window.fetch = window.fetch.bind(window)

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof Request
            ? input.url
            : String(input)

      if (url.includes('/beats/')) {
        return Promise.resolve(
          new Response(new ArrayBuffer(8), {
            status: 200,
            headers: { 'content-type': 'audio/mpeg' },
          })
        )
      }

      return originalFetch(input, init)
    }) as typeof window.fetch

    class MockAudioContext {
      state: AudioContextState = 'running'
      destination = {}
      onstatechange: (() => void) | null = null
      private readonly startedAt = performance.now()

      get currentTime() {
        return (performance.now() - this.startedAt) / 1000
      }

      resume() {
        this.state = 'running'
        this.onstatechange?.()
        return Promise.resolve()
      }

      close() {
        this.state = 'closed'
        this.onstatechange?.()
        return Promise.resolve()
      }

      createGain() {
        return {
          gain: {
            value: 1,
            setValueAtTime: () => undefined,
          },
          connect: () => undefined,
          disconnect: () => undefined,
        }
      }

      createBufferSource() {
        return {
          buffer: null,
          onended: null,
          connect: () => undefined,
          start: () => undefined,
          stop: () => undefined,
          disconnect: () => undefined,
        }
      }

      decodeAudioData() {
        return Promise.resolve({ duration: 120 })
      }
    }

    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      writable: true,
      value: MockAudioContext,
    })
    Object.defineProperty(window, 'webkitAudioContext', {
      configurable: true,
      writable: true,
      value: MockAudioContext,
    })
  })
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

async function expectCenteredInViewport(
  page: Page,
  locator: Locator,
  tolerance = 3
) {
  const box = await locator.boundingBox()
  const viewport = page.viewportSize()
  expect(box).not.toBeNull()
  expect(viewport).not.toBeNull()

  const centerX = (box?.x ?? 0) + (box?.width ?? 0) / 2
  expect(Math.abs(centerX - (viewport?.width ?? 0) / 2)).toBeLessThanOrEqual(
    tolerance
  )
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

async function expectNoBoxOverlap(
  first: Locator,
  second: Locator,
  tolerance = 1
) {
  const firstBox = await first.boundingBox()
  const secondBox = await second.boundingBox()
  expect(firstBox).not.toBeNull()
  expect(secondBox).not.toBeNull()

  const overlapX = Math.max(
    0,
    Math.min(
      (firstBox?.x ?? 0) + (firstBox?.width ?? 0),
      (secondBox?.x ?? 0) + (secondBox?.width ?? 0)
    ) - Math.max(firstBox?.x ?? 0, secondBox?.x ?? 0)
  )
  const overlapY = Math.max(
    0,
    Math.min(
      (firstBox?.y ?? 0) + (firstBox?.height ?? 0),
      (secondBox?.y ?? 0) + (secondBox?.height ?? 0)
    ) - Math.max(firstBox?.y ?? 0, secondBox?.y ?? 0)
  )

  expect(overlapX * overlapY).toBeLessThanOrEqual(tolerance)
}

async function expectContained(
  container: Locator,
  child: Locator,
  tolerance = 2
) {
  const containerBox = await container.boundingBox()
  const childBox = await child.boundingBox()
  expect(containerBox).not.toBeNull()
  expect(childBox).not.toBeNull()

  expect(childBox?.x ?? 0).toBeGreaterThanOrEqual(
    (containerBox?.x ?? 0) - tolerance
  )
  expect(childBox?.y ?? 0).toBeGreaterThanOrEqual(
    (containerBox?.y ?? 0) - tolerance
  )
  expect((childBox?.x ?? 0) + (childBox?.width ?? 0)).toBeLessThanOrEqual(
    (containerBox?.x ?? 0) + (containerBox?.width ?? 0) + tolerance
  )
  expect((childBox?.y ?? 0) + (childBox?.height ?? 0)).toBeLessThanOrEqual(
    (containerBox?.y ?? 0) + (containerBox?.height ?? 0) + tolerance
  )
}

async function expectSizeRatio(
  reference: Locator,
  target: Locator,
  minRatio: number,
  maxRatio: number
) {
  const referenceBox = await reference.boundingBox()
  const targetBox = await target.boundingBox()
  expect(referenceBox).not.toBeNull()
  expect(targetBox).not.toBeNull()

  const widthRatio = (targetBox?.width ?? 0) / (referenceBox?.width ?? 1)
  const heightRatio = (targetBox?.height ?? 0) / (referenceBox?.height ?? 1)

  expect(widthRatio).toBeGreaterThanOrEqual(minRatio)
  expect(widthRatio).toBeLessThanOrEqual(maxRatio)
  expect(heightRatio).toBeGreaterThanOrEqual(minRatio)
  expect(heightRatio).toBeLessThanOrEqual(maxRatio)
}

async function expectWordFitsInnerCircle(
  orb: Locator,
  word: Locator,
  maxWidthRatio = 0.74
) {
  const orbBox = await orb.boundingBox()
  const wordBox = await word.boundingBox()
  expect(orbBox).not.toBeNull()
  expect(wordBox).not.toBeNull()

  const orbCenter = {
    x: (orbBox?.x ?? 0) + (orbBox?.width ?? 0) / 2,
    y: (orbBox?.y ?? 0) + (orbBox?.height ?? 0) / 2,
  }
  const wordCenter = {
    x: (wordBox?.x ?? 0) + (wordBox?.width ?? 0) / 2,
    y: (wordBox?.y ?? 0) + (wordBox?.height ?? 0) / 2,
  }

  expect(wordBox?.width ?? 0).toBeLessThanOrEqual(
    (orbBox?.width ?? 0) * maxWidthRatio
  )
  expect(Math.abs(wordCenter.x - orbCenter.x)).toBeLessThanOrEqual(3)
  expect(Math.abs(wordCenter.y - orbCenter.y)).toBeLessThanOrEqual(
    (orbBox?.height ?? 0) * 0.16
  )
}

async function expectWordRenderedWhole(word: Locator, value: string) {
  await expect(word).toHaveText(value)
  await expect
    .poll(
      async () =>
        word.evaluate((node) => {
          const element = node as HTMLElement
          return Math.ceil(element.scrollWidth - element.clientWidth)
        }),
      { timeout: 5_000 }
    )
    .toBeLessThanOrEqual(1)
  await expect
    .poll(
      async () =>
        word.evaluate((node) => {
          const element = node as HTMLElement
          const styles = window.getComputedStyle(element)
          const lineHeight = Number.parseFloat(styles.lineHeight)
          const fallbackLineHeight = Number.parseFloat(styles.fontSize) * 1.1
          const singleLineHeight = Number.isFinite(lineHeight)
            ? lineHeight
            : fallbackLineHeight

          return element.scrollHeight <= singleLineHeight * 1.35
        }),
      { timeout: 5_000 }
    )
    .toBeTruthy()
}

async function setPracticeWord(word: Locator, value: string) {
  await word.evaluate((node, nextWord) => {
    node.textContent = nextWord
    ;(node as HTMLElement).style.setProperty(
      '--practice-word-length',
      String(Math.max(nextWord.length, 5))
    )
    window.dispatchEvent(new Event('flowforge:fit-practice-word'))
    window.dispatchEvent(new Event('resize'))
  }, value)
  await expectWordRenderedWhole(word, value)
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
    const innerGhostRing = page.getByTestId('practice-inner-ghost-ring')

    await expectSquare(orbFrame)
    await expectSquare(orb)
    await expectConcentric(orb, timerRing)
    await expectConcentric(orb, innerGhostRing)
    await expectSizeRatio(orb, timerRing, 0.98, 1.08)
    await expectSizeRatio(orb, innerGhostRing, 0.66, 0.82)
  })

  test('solo countdown, playing, paused, and siren states stay non-overlapping', async ({
    page,
  }) => {
    await mockPlayableAudio(page)
    await loadPractice(page, {
      selectedBeat: LOCAL_TEST_BEAT,
    })
    await startPractice(page)
    await page.screenshot({
      path: 'artifacts/practice-solo-countdown-iphone-se.png',
    })

    const header = page.locator('header')
    const topControls = page.locator('.practice-top-controls')
    const orb = page.locator('#tour-record-btn')
    const timerRing = page.getByTestId('practice-timer-ring')
    const recordControl = page.locator('.practice-record-area')

    await expectNoVerticalOverlap(header, topControls)
    await expectNoVerticalOverlap(topControls, orb)
    await expectNoVerticalOverlap(orb, recordControl)
    await expectCenteredInViewport(page, timerRing)

    await page.waitForTimeout(3600)
    await page.screenshot({
      path: 'artifacts/practice-solo-playing-iphone-se.png',
    })
    const restartButton = page.getByRole('button', {
      name: /restart session/i,
    })
    const pauseButton = page.getByRole('button', { name: /pause session/i })

    await expect(restartButton).toBeVisible({ timeout: 10_000 })
    await expect(pauseButton).toBeVisible({ timeout: 10_000 })
    await expectNoVerticalOverlap(topControls, orb)
    await expectNoVerticalOverlap(orb, recordControl)
    await expectCenteredInViewport(page, timerRing)
    await expectNoBoxOverlap(restartButton, timerRing)
    await expectNoBoxOverlap(pauseButton, timerRing)

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
      const timerRing = page.getByTestId('practice-timer-ring')
      const cypherRing = page.getByTestId('cypher-ring')
      const segments = page.getByTestId('cypher-ring-segment')
      const visualizer = page.getByTestId('practice-visualizer')
      const glow = page.getByTestId('practice-player-glow')

      await expect(timerRing).toBeVisible()
      await expect(cypherRing).toBeVisible()
      await expect(segments).toHaveCount(players)
      await expectConcentric(orb, timerRing)
      await expectConcentric(orb, cypherRing, 6)
      await expectSizeRatio(orb, timerRing, 0.98, 1.08)
      await expectSizeRatio(orb, cypherRing, 0.66, 0.82)
      await expectSquare(orb)

      const timerStrokeWidths = await timerRing
        .locator('circle')
        .evaluateAll((nodes) =>
          nodes.map((node) => Number(node.getAttribute('stroke-width') || 0))
        )
      expect(timerStrokeWidths.every((width) => width === 4.75)).toBeTruthy()

      const visibleSegmentColors = await segments.evaluateAll((nodes) =>
        nodes.map((node) => ({
          stroke: node.getAttribute('stroke'),
          active: node.getAttribute('data-active') === 'true',
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
      expect(
        visibleSegmentColors.some(
          (segment) => segment.active && segment.width === 6
        )
      ).toBeTruthy()
      expect(
        visibleSegmentColors
          .filter((segment) => !segment.active)
          .every((segment) => segment.width === 2.85)
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

  test('small iPhone WebKit cypher playing layout keeps BALANCE clear of controls and chrome', async ({
    page,
  }) => {
    await mockPlayableAudio(page)
    await loadPractice(page, {
      selectedBeat: LOCAL_TEST_BEAT,
      mode: 'cypher',
      cypherPlayers: 4,
      frequency: 8,
      difficulty: 2,
    })
    await startPractice(page)
    await page.waitForTimeout(3600)

    const pauseButton = page.getByRole('button', { name: /pause session/i })
    await expect(pauseButton).toBeVisible({ timeout: 10_000 })

    const word = page.getByTestId('practice-word')
    await expect(word).toBeVisible()

    const orb = page.locator('#tour-record-btn')
    const timerRing = page.getByTestId('practice-timer-ring')
    const cypherRing = page.getByTestId('cypher-ring')
    const label = page.getByTestId('practice-cypher-label')
    const timer = page.locator('.practice-session-timer')
    const restartButton = page.getByRole('button', {
      name: /restart session/i,
    })
    const recordControl = page.locator('.practice-record-area')
    const bottomNav = page.locator('nav')

    await expect(label).toBeVisible()
    await expect(timer).toBeVisible()
    await expect(timerRing).toBeVisible()
    await expect(cypherRing).toBeVisible()
    await expect(restartButton).toBeVisible()
    await expect(bottomNav).toBeVisible()

    await expectConcentric(orb, timerRing)
    await expectConcentric(orb, cypherRing)
    await expectCenteredInViewport(page, timerRing)
    await expectSizeRatio(orb, timerRing, 0.98, 1.08)
    await expectSizeRatio(orb, cypherRing, 0.66, 0.82)

    for (const prompt of ['BALANCE', 'RESPONSIBILITY', 'TRANSFORMATION']) {
      await setPracticeWord(word, prompt)

      await expectContained(orb, label)
      await expectContained(orb, word)
      await expectContained(orb, timer)
      await expectWordFitsInnerCircle(orb, word)
      await expectNoVerticalOverlap(label, word)
      await expectNoVerticalOverlap(word, timer)
    }

    await expectNoBoxOverlap(restartButton, orb)
    await expectNoBoxOverlap(pauseButton, orb)
    await expectNoBoxOverlap(restartButton, timerRing)
    await expectNoBoxOverlap(pauseButton, timerRing)
    await expectNoVerticalOverlap(orb, recordControl)
    await expectNoVerticalOverlap(recordControl, bottomNav)

    await setPracticeWord(word, 'BALANCE')
    await page.screenshot({
      path: 'artifacts/practice-cypher-4p-balance-safari-compact.png',
    })
  })

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
        expect(controlBox.height).toBeGreaterThanOrEqual(44)
        expect(controlBox.y).toBeGreaterThanOrEqual((box?.y ?? 0) - 3)
        expect(controlBox.y + controlBox.height).toBeLessThanOrEqual(
          (box?.y ?? 0) + (box?.height ?? 0) + 1
        )
      }
    }
  })
})

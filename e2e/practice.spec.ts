import { test, expect, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

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

type MockBeat = {
  id: string
  title: string
  bpm: number
  storageUrl: string
  coverImage: string | null
  isPremium: boolean
  genre: string | null
  tags: string[]
  duration: number | null
  artistName: string | null
  label: string | null
  difficulty: string
  uploaderId: string | null
  offset: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

function createSilentWav(durationSeconds: number, sampleRate = 8000): Buffer {
  const sampleCount = Math.max(1, Math.floor(durationSeconds * sampleRate))
  const dataSize = sampleCount * 2
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  return buffer
}

function loadDatabaseUrlFromEnvFiles() {
  if (process.env.DATABASE_URL) return

  const envFiles = ['.env.local', '.env']
  for (const file of envFiles) {
    if (!existsSync(file)) continue

    const content = readFileSync(file, 'utf8')
    const lines = content.split(/\r?\n/)

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const delimiterIndex = trimmed.indexOf('=')
      if (delimiterIndex <= 0) continue

      const key = trimmed.slice(0, delimiterIndex).trim()
      if (!['DATABASE_URL', 'DIRECT_URL'].includes(key)) continue

      let value = trimmed.slice(delimiterIndex + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      if (value && !process.env[key]) {
        process.env[key] = value
      }
    }

    if (process.env.DATABASE_URL) return
  }
}

test('private track arrow handoff preselects beat and starts practice at calibrated offset', async ({
  page,
}) => {
  test.setTimeout(120_000)

  loadDatabaseUrlFromEnvFiles()
  if (!process.env.DATABASE_URL) {
    test.skip(
      true,
      'DATABASE_URL is required for database-backed NextAuth session bootstrap'
    )
  }

  const prisma = new PrismaClient()
  let createdUserId: string | null = null
  let createdSessionToken: string | null = null

  const now = new Date().toISOString()
  const userBeat: MockBeat = {
    id: 'pw-user-beat-1',
    title: 'Playwright Private Beat',
    bpm: 91,
    storageUrl: '/beats/pw-short-loop.wav',
    coverImage: null,
    isPremium: false,
    genre: 'Hip-Hop',
    tags: [],
    duration: 1,
    artistName: 'PW Artist',
    label: null,
    difficulty: 'Medium',
    uploaderId: null,
    offset: 0.8,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  }
  const publicBeat: MockBeat = {
    id: 'pw-public-beat-1',
    title: 'Playwright Public Beat',
    bpm: 88,
    storageUrl: '/beats/2-Naughty.mp3',
    coverImage: null,
    isPremium: false,
    genre: 'Hip-Hop',
    tags: [],
    duration: 1,
    artistName: null,
    label: null,
    difficulty: 'Medium',
    uploaderId: null,
    offset: 0,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  }

  await page.addInitScript(() => {
    type LoopProbeEvent = {
      type: string
      currentTime: number
      loopStartSeconds: number
      loopCount?: number
      at: number
    }
    type ProbeWindow = Window & { __loopProbeEvents?: LoopProbeEvent[] }

    const probeWindow = window as ProbeWindow
    probeWindow.__loopProbeEvents = []
    window.addEventListener('freestyla:audio-loop', (event) => {
      const customEvent = event as CustomEvent<LoopProbeEvent>
      probeWindow.__loopProbeEvents?.push({
        ...customEvent.detail,
        at: performance.now(),
      })
    })
  })

  try {
    const userId = randomUUID()
    const sessionToken = `pw-session-${randomUUID()}`
    const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.$connect()
    await prisma.user.create({
      data: {
        id: userId,
        email: `pw-pro-${userId}@example.com`,
        name: 'Playwright Pro',
        username: `pwpro${userId.slice(0, 8)}`,
        profileSetupCompletedAt: new Date('2026-03-24T10:00:00.000Z'),
        role: 'SUPERADMIN',
        subscriptionStatus: 'active',
      },
    })
    await prisma.session.create({
      data: {
        sessionToken,
        userId,
        expires: sessionExpiresAt,
      },
    })

    createdUserId = userId
    createdSessionToken = sessionToken
    userBeat.uploaderId = userId

    await page.context().addCookies([
      {
        name: 'next-auth.session-token',
        value: sessionToken,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
        expires: Math.floor(sessionExpiresAt.getTime() / 1000),
      },
    ])
  } catch {
    test.skip(
      true,
      'Database-backed NextAuth session bootstrap is required for this regression'
    )
  }

  try {
    await page.route('**/api/user/beats**', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue()
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ beats: [userBeat] }),
      })
    })

    await page.route('**/api/beats**', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue()
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ beats: [publicBeat] }),
      })
    })

    await page.route('**/beats/pw-short-loop.wav', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'audio/wav',
        body: createSilentWav(1),
      })
    })

    await page.goto('/tracks?tab=mine')
    await expect(page.getByText('Beat Vault')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: userBeat.title })
    ).toBeVisible({
      timeout: 20_000,
    })

    await page.getByRole('heading', { name: userBeat.title }).hover()
    await page.getByLabel('Use this track').first().click({ force: true })

    await expect(page).toHaveURL(
      new RegExp(`/difficultyselection\\?beatId=${userBeat.id}`)
    )
    await expect(page.getByText('BEAT_NOT_FOUND')).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: new RegExp(userBeat.title, 'i') })
    ).toBeVisible()

    await page.getByRole('button', { name: /^Practice$/i }).click()
    await expect(page).toHaveURL(/\/practice/)

    const startButton = page.locator('#tour-record-btn')
    await expect(startButton).toBeVisible({ timeout: 15_000 })
    await ensureSessionPlaying(page)

    await expect
      .poll(
        async () =>
          await page.evaluate(() => {
            const probeWindow = window as Window & {
              __loopProbeEvents?: Array<{
                type: string
                currentTime: number
                loopStartSeconds: number
                loopCount?: number
                at: number
              }>
            }
            return (
              probeWindow.__loopProbeEvents?.filter(
                (entry) => entry.type === 'loop'
              ).length ?? 0
            )
          }),
        { timeout: 20_000 }
      )
      .toBeGreaterThan(2)

    const loopProbeEvents = await page.evaluate(() => {
      const probeWindow = window as Window & {
        __loopProbeEvents?: Array<{
          type: string
          currentTime: number
          loopStartSeconds: number
          loopCount?: number
          at: number
        }>
      }
      return probeWindow.__loopProbeEvents ?? []
    })

    expect(
      loopProbeEvents.some(
        (entry) =>
          entry.type === 'play' &&
          entry.currentTime >= 0.75 &&
          entry.currentTime <= 0.85
      )
    ).toBeTruthy()
    expect(
      loopProbeEvents
        .filter((entry) => entry.type === 'loop')
        .every((entry) => entry.loopStartSeconds === 0.8)
    ).toBeTruthy()
  } finally {
    if (createdSessionToken) {
      await prisma.session.deleteMany({
        where: { sessionToken: createdSessionToken },
      })
    }
    if (createdUserId) {
      await prisma.user.deleteMany({
        where: { id: createdUserId },
      })
    }
    await prisma.$disconnect()
  }
})

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

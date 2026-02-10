import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { chromium } from '@playwright/test'

const CDP_URL = process.env.CDP_URL ?? 'http://127.0.0.1:9222'
const BASE_URL =
  process.env.BASE_URL ?? 'https://www.freestyla.app'
const WAIT_FOR_AUTH_SECONDS = Number(process.env.WAIT_FOR_AUTH_SECONDS ?? '0')
const OUTPUT_PATH = process.env.OUTPUT_PATH

function nowIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function redactSession(session) {
  if (!session || typeof session !== 'object') return null
  const user = session.user && typeof session.user === 'object' ? session.user : null
  const role = user && typeof user.role === 'string' ? user.role : null
  const subscriptionStatus =
    user && typeof user.subscriptionStatus === 'string'
      ? user.subscriptionStatus
      : null
  const isAuthenticated = Boolean(user && typeof user.id === 'string' && user.id)
  return { isAuthenticated, role, subscriptionStatus }
}

async function getSession(page) {
  try {
    const res = await page.request.get(`${BASE_URL}/api/auth/session`, {
      headers: { 'Cache-Control': 'no-cache' },
    })
    if (!res.ok()) return null
    const json = await res.json()
    return redactSession(json)
  } catch {
    return null
  }
}

async function waitForAuth(page) {
  if (!WAIT_FOR_AUTH_SECONDS || WAIT_FOR_AUTH_SECONDS <= 0) return getSession(page)

  const deadline = Date.now() + WAIT_FOR_AUTH_SECONDS * 1000
  while (Date.now() < deadline) {
    const session = await getSession(page)
    if (session?.isAuthenticated) return session
    // eslint-disable-next-line no-await-in-loop
    await page.waitForTimeout(1000)
  }

  return getSession(page)
}

async function safeGoto(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  // Best-effort: allow client-side redirects and late hydration.
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
}

function result(status, name, details = undefined) {
  return { status, name, details }
}

async function checkRedirect(page, fromPath, expectedPathRegex) {
  await safeGoto(page, `${BASE_URL}${fromPath}`)
  await page.waitForURL(expectedPathRegex, { timeout: 15_000 }).catch(() => {})
  const finalUrl = page.url()
  const ok = expectedPathRegex.test(finalUrl)
  return ok
    ? result('PASS', `redirect ${fromPath}`, finalUrl)
    : result('FAIL', `redirect ${fromPath}`, { finalUrl, expected: String(expectedPathRegex) })
}

async function checkHeading(page, pathName, headingRegex) {
  await safeGoto(page, `${BASE_URL}${pathName}`)
  const heading = page.getByRole('heading', { name: headingRegex })
  const visible = await heading
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true)
    .catch(() => false)
  return visible
    ? result('PASS', `heading ${pathName}`, String(headingRegex))
    : result('FAIL', `heading ${pathName}`, `Missing heading ${headingRegex}`)
}

async function check404(page, pathName) {
  await safeGoto(page, `${BASE_URL}${pathName}`)
  const heading = page.getByRole('heading', { name: /^404$/ })
  const visible = await heading
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true)
    .catch(() => false)
  return visible
    ? result('PASS', `404 ${pathName}`)
    : result('FAIL', `404 ${pathName}`, `Expected 404 page`)
}

async function checkPracticeStart(page) {
  await safeGoto(page, `${BASE_URL}/practice`)
  // Prefer the stable tour id used by existing Playwright E2E specs.
  const startButton = page.locator('#tour-record-btn')
  const hasStart = await startButton
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true)
    .catch(() => false)
  if (!hasStart) return result('FAIL', 'practice start', 'Start button not visible')

  await startButton.click({ force: true }).catch(() => null)
  // Evidence of a started session: the primary button loses the "START" label.
  const startedByLabel = await startButton
    .filter({ hasNotText: /start/i })
    .first()
    .waitFor({ state: 'visible', timeout: 20_000 })
    .then(() => true)
    .catch(() => false)

  const pausedButton = page.getByRole('button', { name: /pause session/i })
  const pauseVisible = await pausedButton.isVisible({ timeout: 5_000 }).catch(() => false)

  return startedByLabel
    ? result('PASS', 'practice start', { startedByLabel: true, pauseVisible })
    : result('FAIL', 'practice start', { startedByLabel: false, pauseVisible })
}

async function checkProGateOnTracks(page) {
  await safeGoto(page, `${BASE_URL}/tracks`)
  const myTracks = page.getByRole('button', { name: /^My Tracks$/ })
  const hasMyTracks = await myTracks.isVisible().catch(() => false)
  if (!hasMyTracks) return result('FAIL', 'tracks my-tracks gate', 'My Tracks button missing')

  await myTracks.click({ force: true }).catch(() => null)
  const upsell = page.getByRole('heading', { name: /unlock the secret beat vault/i })
  const upsellVisible = await upsell.isVisible({ timeout: 10_000 }).catch(() => false)
  return result('INFO', 'tracks my-tracks gate', { upsellVisible })
}

async function checkAdminAccess(page) {
  await safeGoto(page, `${BASE_URL}/admin`)
  const url = page.url()
  // Admin route is dynamic; on deny it may redirect to onboarding.
  const denied = /\/howitworks/.test(url)
  if (denied) return result('INFO', 'admin access', { allowed: false, url })

  const heading = page.getByRole('heading', { name: /admin/i })
  const visible = await heading.isVisible().catch(() => false)
  return result('INFO', 'admin access', { allowed: visible, url })
}

async function main() {
  const results = []
  const meta = { date: nowIsoDate(), baseUrl: BASE_URL, cdpUrl: CDP_URL }

  let browser
  try {
    browser = await chromium.connectOverCDP(CDP_URL)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[prod-launch-audit] Failed to connect to Chrome CDP:', message)
    console.error(
      '[prod-launch-audit] Start Chrome with: chrome.exe --remote-debugging-port=9222 --user-data-dir=<path>'
    )
    process.exit(2)
  }

  const context = browser.contexts()[0] ?? (await browser.newContext())
  const page = context.pages()[0] ?? (await context.newPage())

  results.push(await checkRedirect(page, '/', /\/howitworks/))
  results.push(await checkHeading(page, '/howitworks', /THE BLUEPRINT/i))
  results.push(await checkHeading(page, '/tracks', /BEAT VAULT/i))
  results.push(await check404(page, '/discover'))
  results.push(await checkPracticeStart(page))

  const session = await waitForAuth(page)
  results.push(result('INFO', 'session', session ?? { isAuthenticated: false }))

  results.push(await checkProGateOnTracks(page))

  if (session?.isAuthenticated) {
    results.push(await checkRedirect(page, '/recordings', /\/recordings/))
    // `/profile` is a legacy route that may redirect to a public profile slug (`/u/[username]`).
    results.push(await checkRedirect(page, '/profile', /\/(profile|u\/)/))
    results.push(await checkAdminAccess(page))
  } else {
    results.push(await checkRedirect(page, '/recordings', /\/howitworks/))
    results.push(await checkRedirect(page, '/profile', /\/howitworks/))
  }

  const summary = {
    meta,
    counts: {
      pass: results.filter((r) => r.status === 'PASS').length,
      fail: results.filter((r) => r.status === 'FAIL').length,
      info: results.filter((r) => r.status === 'INFO').length,
    },
    results,
  }

  const json = JSON.stringify(summary, null, 2)
  console.log(json)

  const outputPath =
    OUTPUT_PATH ??
    path.join(process.cwd(), 'brain', `PROD_LAUNCH_AUDIT_${nowIsoDate()}.json`)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, json, 'utf8')
  console.error(`[prod-launch-audit] Wrote: ${outputPath}`)

  await browser.close()

  if (summary.counts.fail > 0) process.exit(1)
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error)
  console.error('[prod-launch-audit] Unexpected error:', message)
  process.exit(1)
})

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execSync } from 'node:child_process'

const envArg =
  process.argv.find((arg) => arg.startsWith('--environment=')) ||
  '--environment=production'
const environment = envArg.split('=')[1] || 'production'
const tmpFile = path.join(os.tmpdir(), `flowforge-vercel-env-${Date.now()}.env`)

const requiredNameGroups = [
  ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_APP_URL'],
  ['NEXTAUTH_URL'],
  ['NEXTAUTH_SECRET'],
  ['GOOGLE_CLIENT_ID'],
  ['GOOGLE_CLIENT_SECRET'],
  ['NEXT_PUBLIC_SUPABASE_URL'],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  ['SUPABASE_SERVICE_ROLE_KEY'],
  ['DATABASE_URL'],
  ['DIRECT_URL'],
  ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
  ['STRIPE_SECRET_KEY'],
  ['STRIPE_WEBHOOK_SECRET'],
  ['STRIPE_PRICE_ID_MONTHLY'],
  ['STRIPE_PRICE_ID_YEARLY', 'STRIPE_PRICE_ID_ANNUAL'],
]

try {
  const listOutput = execSync(`npx vercel env ls ${environment}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const names = parseEnvNames(listOutput)
  const missingNameGroups = requiredNameGroups.filter(
    (group) => !group.some((key) => names.has(key))
  )

  if (missingNameGroups.length > 0) {
    console.error(`[vercel-env] FAILED (${environment})`)
    console.error('Missing required variable names in Vercel:')
    for (const group of missingNameGroups) {
      console.error(`- ${group.join(' or ')}`)
    }
    process.exit(1)
  }

  execSync(`npx vercel env pull ${tmpFile} --environment=${environment} --yes`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const env = parseEnvFile(tmpFile)
  const valueErrors = validatePulledValues(env)
  if (valueErrors.length > 0) {
    console.error(`[vercel-env] FAILED (${environment})`)
    console.error('Invalid non-sensitive Vercel env values:')
    for (const err of valueErrors) {
      console.error(`- ${err}`)
    }
    process.exit(1)
  }

  console.log(
    `[vercel-env] OK (${environment}): required names exist and non-sensitive values are valid.`
  )
} catch (error) {
  const err = error instanceof Error ? error.message : String(error)
  console.error(`[vercel-env] FAILED (${environment})`)
  console.error(err)
  process.exit(1)
} finally {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile)
}

function parseEnvNames(text) {
  const keys = new Set()
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (
      trimmed.startsWith('Vercel CLI') ||
      trimmed.startsWith('Retrieving project') ||
      trimmed.startsWith('>')
    ) {
      continue
    }
    const firstToken = trimmed.split(/\s+/)[0]
    if (/^[A-Z0-9_]+$/.test(firstToken)) keys.add(firstToken)
  }
  return keys
}

function parseEnvFile(filePath) {
  const map = new Map()
  const text = fs.readFileSync(filePath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx < 0) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    map.set(key, value)
  }
  return map
}

function validatePulledValues(env) {
  const errors = []

  const siteUrl = getAny(env, ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_APP_URL'])
  if (!siteUrl) {
    errors.push('NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL is empty')
  } else {
    const urlError = validateUrl(siteUrl, true)
    if (urlError) errors.push(`NEXT_PUBLIC_SITE_URL/NEXT_PUBLIC_APP_URL ${urlError}`)
  }

  const nextAuthUrl = getAny(env, ['NEXTAUTH_URL'])
  if (!nextAuthUrl) {
    errors.push('NEXTAUTH_URL is empty')
  } else {
    const urlError = validateUrl(nextAuthUrl, true)
    if (urlError) errors.push(`NEXTAUTH_URL ${urlError}`)
  }

  const googleClientId = getAny(env, ['GOOGLE_CLIENT_ID'])
  if (!googleClientId || !googleClientId.endsWith('.apps.googleusercontent.com')) {
    errors.push('GOOGLE_CLIENT_ID is empty or malformed')
  }

  const supabaseUrl = getAny(env, ['NEXT_PUBLIC_SUPABASE_URL'])
  if (!supabaseUrl || !supabaseUrl.includes('.supabase.co')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is empty or not a supabase.co URL')
  }

  const anonKey = getAny(env, ['NEXT_PUBLIC_SUPABASE_ANON_KEY'])
  if (!anonKey || anonKey.length < 32) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is empty or too short')
  }

  const publishable = getAny(env, ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'])
  if (!publishable || !publishable.startsWith('pk_live_')) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be a live key (pk_live_)')
  }

  const priceMonthly = getAny(env, ['STRIPE_PRICE_ID_MONTHLY'])
  if (!priceMonthly || !priceMonthly.startsWith('price_')) {
    errors.push('STRIPE_PRICE_ID_MONTHLY is empty or malformed')
  }

  const priceYearly = getAny(env, ['STRIPE_PRICE_ID_YEARLY', 'STRIPE_PRICE_ID_ANNUAL'])
  if (!priceYearly || !priceYearly.startsWith('price_')) {
    errors.push('STRIPE_PRICE_ID_YEARLY/STRIPE_PRICE_ID_ANNUAL is empty or malformed')
  }

  return errors
}

function getAny(env, keys) {
  for (const key of keys) {
    const value = env.get(key)
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function validateUrl(value, requireHttps) {
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    return 'must be a valid absolute URL'
  }
  if (requireHttps && parsed.protocol !== 'https:') {
    return 'must use https'
  }
  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) {
    return 'cannot use localhost'
  }
  return null
}

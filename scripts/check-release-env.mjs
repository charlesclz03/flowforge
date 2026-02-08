const cliArgs = process.argv.slice(2)
const cliModeArg = cliArgs.find((arg) => arg.startsWith('--mode='))
const cliMode = cliModeArg ? cliModeArg.split('=')[1] : null
const mode = (cliMode || process.env.RELEASE_ENV_MODE || 'production').toLowerCase()
const strictProduction = mode === 'production'
const allowLocalUrls =
  process.env.RELEASE_ALLOW_LOCAL_URLS === 'true' ||
  cliArgs.includes('--allow-local-urls')
const localhostHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0'])

const PLACEHOLDER_PATTERNS = [
  /<[^>]+>/, // <PROJECT_REF>, <PASSWORD>, etc.
  /\byour[_-]/i,
  /\bexample\b/i,
  /\bchangeme\b/i,
  /\breplace[-_ ]?me\b/i,
  /\btodo\b/i,
  /\.\.\./,
]

const checks = [
  {
    key: 'NEXT_PUBLIC_SITE_URL',
    aliases: ['NEXT_PUBLIC_APP_URL'],
    description: 'Public app URL',
    validate: (value) => validateUrl(value, { requireHttps: strictProduction }),
  },
  {
    key: 'NEXTAUTH_URL',
    description: 'NextAuth callback base URL',
    validate: (value) => validateUrl(value, { requireHttps: strictProduction }),
  },
  {
    key: 'NEXTAUTH_SECRET',
    description: 'NextAuth encryption secret',
    validate: (value) =>
      value.length < 32 ? 'must be at least 32 characters' : null,
  },
  {
    key: 'GOOGLE_CLIENT_ID',
    description: 'Google OAuth client id',
    validate: (value) =>
      value.endsWith('.apps.googleusercontent.com')
        ? null
        : 'must end with .apps.googleusercontent.com',
  },
  {
    key: 'GOOGLE_CLIENT_SECRET',
    description: 'Google OAuth client secret',
    validate: (value) =>
      value.length < 16 ? 'looks too short for a Google client secret' : null,
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    validate: (value) =>
      value.includes('.supabase.co')
        ? validateUrl(value, { requireHttps: true })
        : 'must target a supabase.co project URL',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anon/publishable key',
    validate: (value) =>
      value.length < 32 ? 'looks too short for a Supabase key' : null,
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key',
    validate: (value) =>
      value.length < 32 ? 'looks too short for a service role key' : null,
  },
  {
    key: 'DATABASE_URL',
    description: 'Primary Prisma database URL',
    validate: (value) =>
      /^(postgres|postgresql):\/\//i.test(value)
        ? null
        : 'must start with postgres:// or postgresql://',
  },
  {
    key: 'DIRECT_URL',
    description: 'Direct Prisma migration URL',
    validate: (value) =>
      /^(postgres|postgresql):\/\//i.test(value)
        ? null
        : 'must start with postgres:// or postgresql://',
  },
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe publishable key',
    validate: (value) => {
      if (strictProduction) return value.startsWith('pk_live_') ? null : 'must be a live key (pk_live_) in production mode'
      return value.startsWith('pk_test_') || value.startsWith('pk_live_')
        ? null
        : 'must start with pk_test_ or pk_live_'
    },
  },
  {
    key: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key',
    validate: (value) => {
      if (strictProduction) return value.startsWith('sk_live_') ? null : 'must be a live key (sk_live_) in production mode'
      return value.startsWith('sk_test_') || value.startsWith('sk_live_')
        ? null
        : 'must start with sk_test_ or sk_live_'
    },
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe webhook signing secret',
    validate: (value) =>
      value.startsWith('whsec_') ? null : 'must start with whsec_',
  },
  {
    key: 'STRIPE_PRICE_ID_MONTHLY',
    description: 'Stripe monthly price id',
    validate: (value) =>
      value.startsWith('price_') ? null : 'must start with price_',
  },
  {
    key: 'STRIPE_PRICE_ID_YEARLY',
    aliases: ['STRIPE_PRICE_ID_ANNUAL'],
    description: 'Stripe yearly price id',
    validate: (value) =>
      value.startsWith('price_') ? null : 'must start with price_',
  },
]

const missing = []
const invalid = []

for (const check of checks) {
  const { value: raw } = resolveEnvValue(check)
  const value = typeof raw === 'string' ? raw.trim() : ''

  if (!value) {
    missing.push(check)
    continue
  }

  if (looksPlaceholder(value)) {
    invalid.push({
      key: check.key,
      reason: 'contains a placeholder/example value',
      description: check.description,
    })
    continue
  }

  const reason = check.validate(value)
  if (reason) {
    invalid.push({ key: check.key, reason, description: check.description })
  }
}

if (missing.length || invalid.length) {
  console.error(`[release-env] FAILED (${mode} mode)`)

  if (missing.length) {
    console.error('\nMissing variables:')
    for (const item of missing) {
      const aliasText =
        item.aliases && item.aliases.length
          ? ` (or ${item.aliases.join(', ')})`
          : ''
      console.error(`- ${item.key}${aliasText}: ${item.description}`)
    }
  }

  if (invalid.length) {
    console.error('\nInvalid variables:')
    for (const item of invalid) {
      console.error(`- ${item.key}: ${item.reason}`)
    }
  }

  console.error('\nTip: use env.example as the canonical template.')
  process.exit(1)
}

console.log(
  `[release-env] OK (${mode} mode): all required variables are present and valid.`
)

function looksPlaceholder(value) {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))
}

function resolveEnvValue(check) {
  const candidates = [check.key, ...(check.aliases || [])]
  for (const key of candidates) {
    const value = process.env[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      return { key, value }
    }
  }

  // Keep canonical key in reports when nothing is usable.
  return { key: check.key, value: process.env[check.key] }
}

function validateUrl(value, options) {
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    return 'must be a valid absolute URL'
  }

  if (options.requireHttps && parsed.protocol !== 'https:') {
    if (!(allowLocalUrls && localhostHosts.has(parsed.hostname))) {
      return 'must use https in production mode'
    }
  }

  if (strictProduction && localhostHosts.has(parsed.hostname) && !allowLocalUrls) {
    return 'cannot point to localhost in production mode'
  }

  return null
}

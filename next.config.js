/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */
// v0.9.69 - Security Hardening (Fort Knox)

const isDev = process.env.NODE_ENV === 'development'

let supabaseHostname
try {
  supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
    : undefined
} catch {
  supabaseHostname = undefined
}

const supabaseHttps = supabaseHostname
  ? `https://${supabaseHostname}`
  : 'https://*.supabase.co'
const supabaseWss = supabaseHostname
  ? `wss://${supabaseHostname}`
  : 'wss://*.supabase.co'

// Security Headers Configuration
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), geolocation=(), microphone=(self)',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      [
        "script-src 'self'",
        "'unsafe-inline'",
        ...(isDev ? ["'unsafe-eval'"] : []),
        'https://www.googletagmanager.com',
        'https://js.stripe.com',
        'https://*.sentry.io',
      ].join(' '),
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `img-src 'self' data: blob: ${supabaseHttps} https://lh3.googleusercontent.com https://storage.googleapis.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.google.com https://*.google.pt`,
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src 'self' blob: ${supabaseHttps} ${supabaseWss} https://accounts.google.com https://api.stripe.com https://*.sentry.io https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://stats.g.doubleclick.net`,
      "frame-src 'self' https://accounts.google.com https://js.stripe.com https://www.youtube.com",
      `media-src 'self' blob: ${supabaseHttps}`,
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig = {
  // DISABLED: StrictMode causes effects to run twice, breaking the timer animation loop
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      ...(supabaseHostname
        ? [
            {
              protocol: 'https',
              hostname: supabaseHostname,
            },
          ]
        : [
            {
              protocol: 'https',
              hostname: '**.supabase.co',
            },
          ]),
    ],
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      (warning) => {
        const message = warning?.message || ''
        const resource = warning?.module?.resource?.replace(/\\/g, '/') || ''

        return (
          message.includes(
            'Critical dependency: the request of a dependency is an expression'
          ) &&
          resource.includes(
            '@prisma/instrumentation/node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js'
          )
        )
      },
    ]

    return config
  },
}

// Injected content via Sentry Wizard
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require('@sentry/nextjs')

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: require('./cache.js'),
})

if (process.env.NODE_ENV === 'development') {
  module.exports = withPWA(nextConfig)
} else if (process.env.SENTRY_AUTH_TOKEN) {
  module.exports = withSentryConfig(
    withPWA(nextConfig),
    {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      // Suppresses source map uploading logs during build
      silent: true,
      org: 'flowforge',
      project: 'flowforge-freestyle',
    },
    {
      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Transpiles SDK to be compatible with IE11 (increases bundle size)
      transpileClientSDK: true,

      // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
      tunnelRoute: '/monitoring',

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
    }
  )
} else {
  // Production build without Sentry (e.g. CI without secrets)
  module.exports = withPWA(nextConfig)
}

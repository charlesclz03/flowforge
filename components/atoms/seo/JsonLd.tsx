const SITE_URL = 'https://www.freestyla.app'

type JsonLdProps = {
  data: Record<string, unknown>
}

/**
 * Server-rendered JSON-LD structured data.
 *
 * IMPORTANT: this intentionally renders a plain <script type="application/ld+json">
 * tag so the structured data is present in the initial SSR HTML. Do NOT switch this
 * back to `next/script` with `strategy="afterInteractive"` — that injects the markup
 * only after hydration, which means search engines and link-preview crawlers that do
 * not execute client JavaScript never see it.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Static, trusted schema objects — safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'FreeStyla',
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512x512.png`,
  description:
    'FreeStyla is a freestyle rap practice tool with beat-synced word prompts, solo and cypher modes, recordings, and a review studio.',
  // TODO(owner): add live social profile URLs (TikTok / YouTube / Instagram / X)
  // once the accounts are connected so Google can verify the brand entity.
  sameAs: [] as string[],
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'FreeStyla',
  url: SITE_URL,
  inLanguage: ['en', 'fr', 'pt'],
  description:
    'Practice freestyle rap with beat-synced word prompts, solo or 4-player cypher mode, recordings, and a review studio. Available in English, French, and Portuguese.',
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${SITE_URL}/#app`,
  name: 'FreeStyla',
  url: SITE_URL,
  applicationCategory: 'MultimediaApplication',
  applicationSubCategory: 'Music Practice',
  operatingSystem: 'Web, Android',
  inLanguage: ['en', 'fr', 'pt'],
  description:
    'Freestyle rap practice tool: pick a beat, set your language and difficulty, and freestyle in time with beat-synced word prompts. Solo or 4-player cypher, recordings, and a review studio.',
  publisher: { '@id': `${SITE_URL}/#organization` },
  // Accurate, evidence-based offers — no fabricated ratings or review counts.
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '0',
    highPrice: '49',
    offerCount: '3',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        name: 'Pro Monthly',
        price: '4.99',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        name: 'Pro Annual',
        price: '49',
        priceCurrency: 'EUR',
      },
    ],
  },
}

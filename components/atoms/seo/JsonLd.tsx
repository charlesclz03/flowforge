import Script from 'next/script'

type JsonLdProps = {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'FreeStyla',
  url: 'https://freestyla.app', // Update with actual domain
  description: 'The ultimate app for rappers to practice freestyle, record sessions, and level up their skills.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://freestyla.app/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

export const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'FreeStyla',
  operatingSystem: 'Any',
  applicationCategory: 'EntertainmentApplication',
  offers: {
    '@type': 'Offer',
    price: '0.00',
    priceCurrency: 'USD',
  },
}

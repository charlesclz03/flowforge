export const JsonLd = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FreeStyla',
    applicationCategory: 'MusicApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'FlowForge',
      url: 'https://freestyla.app',
    },
    description:
      'The #1 Freestyle Rap Coach. Dominate the cypher with instant beat sync and a smart Rhyme Engine.',
    screenshot: 'https://freestyla.app/og-image.png',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

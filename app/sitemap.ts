import { MetadataRoute } from 'next'
import {
  PROGRAMMATIC_PAGES,
  getProgrammaticTranslations,
} from '@/lib/seo/programmatic-pages'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.freestyla.app'

  const learnPages: MetadataRoute.Sitemap = PROGRAMMATIC_PAGES.map((page) => {
    const languages: Record<string, string> = {
      [page.lang]: `${baseUrl}/learn/${page.slug}`,
    }
    for (const translation of getProgrammaticTranslations(page)) {
      languages[translation.lang] = `${baseUrl}/learn/${translation.slug}`
    }

    return {
      url: `${baseUrl}/learn/${page.slug}`,
      lastModified: new Date(page.updated),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages },
    }
  })

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/howitworks`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/practice`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tracks`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...learnPages,
  ]
}

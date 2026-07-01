import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/atoms/seo/JsonLd'
import {
  getProgrammaticPage,
  getProgrammaticRelated,
  getProgrammaticSlugs,
  getProgrammaticTranslations,
  LANG_LABEL,
  type PageLang,
} from '@/lib/seo/programmatic-pages'

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://www.freestyla.app'

const OG_LOCALE: Record<PageLang, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  pt: 'pt_BR',
}

type LearnPageParams = { slug: string }

export function generateStaticParams(): LearnPageParams[] {
  return getProgrammaticSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LearnPageParams>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getProgrammaticPage(slug)
  if (!page) return {}

  const path = `/learn/${page.slug}`
  const languages: Record<string, string> = { [page.lang]: path }
  for (const translation of getProgrammaticTranslations(page)) {
    languages[translation.lang] = `/learn/${translation.slug}`
  }

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: path,
      languages,
    },
    openGraph: {
      type: 'article',
      locale: OG_LOCALE[page.lang],
      url: path,
      title: page.title,
      description: page.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
    },
  }
}

export default async function LearnArticlePage({
  params,
}: {
  params: Promise<LearnPageParams>
}) {
  const { slug } = await params
  const page = getProgrammaticPage(slug)
  if (!page) notFound()

  const translations = getProgrammaticTranslations(page)
  const related = getProgrammaticRelated(page)
  const canonicalUrl = `${SITE_URL}/learn/${page.slug}`

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.h1,
    description: page.description,
    inLanguage: page.lang,
    datePublished: page.updated,
    dateModified: page.updated,
    mainEntityOfPage: canonicalUrl,
    author: { '@type': 'Organization', name: 'FreeStyla', url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#organization` },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: page.lang,
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: `${SITE_URL}/learn` },
      { '@type': 'ListItem', position: 3, name: page.h1, item: canonicalUrl },
    ],
  }

  return (
    <article
      lang={page.lang}
      className="mx-auto w-full max-w-3xl px-5 pb-16 pt-8 sm:pt-12"
    >
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-text-tertiary"
      >
        <Link href="/" className="transition-colors hover:text-text-secondary">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link
          href="/learn"
          className="transition-colors hover:text-text-secondary"
        >
          Learn
        </Link>
      </nav>

      <header className="mt-5">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {page.h1}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-secondary">
          {page.intro}
        </p>

        {translations.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-text-tertiary">Also in:</span>
            {translations.map((translation) => (
              <Link
                key={translation.slug}
                href={`/learn/${translation.slug}`}
                hrefLang={translation.lang}
                className="rounded-full border border-stroke-subtle/60 bg-background-card/60 px-3 py-1 font-medium text-text-secondary transition-colors hover:border-accent-purple/40 hover:text-white"
              >
                {LANG_LABEL[translation.lang]}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="mt-10 space-y-8">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold text-white">
              {section.heading}
            </h2>
            <p className="mt-3 leading-relaxed text-text-secondary">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border border-stroke-glow/50 bg-background-card/50 p-7 text-center backdrop-blur-light">
        <h2 className="text-xl font-semibold text-white">
          Put it into practice
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          Beat-synced word prompts, solo or cypher, in EN, FR, and PT. Free to
          start, no card needed.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/difficultyselection"
            className="w-full rounded-full bg-primary px-7 py-3 text-center text-sm font-semibold text-primary-foreground shadow-neon transition hover:bg-primary/90 hover:shadow-glow sm:w-auto"
          >
            Start practicing
          </Link>
          <Link
            href="/howitworks"
            className="w-full rounded-full border border-stroke-subtle/60 px-7 py-3 text-center text-sm font-medium text-text-secondary transition-colors hover:border-accent-purple/40 hover:text-white sm:w-auto"
          >
            How it works
          </Link>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-white">
          Frequently asked questions
        </h2>
        <div className="mt-5 space-y-3">
          {page.faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-stroke-subtle/40 bg-background-card/40 p-5 backdrop-blur-light"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-white">
                <span>{faq.question}</span>
                <span
                  aria-hidden
                  className="text-text-tertiary transition-transform group-open:rotate-180"
                >
                  v
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-white">Keep reading</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/learn/${item.slug}`}
                className="rounded-2xl border border-stroke-subtle/40 bg-background-card/40 p-5 transition-colors hover:border-accent-purple/40"
              >
                <span className="text-sm font-medium text-white">
                  {item.h1}
                </span>
                <span className="mt-1 block text-xs text-text-tertiary">
                  {LANG_LABEL[item.lang]}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

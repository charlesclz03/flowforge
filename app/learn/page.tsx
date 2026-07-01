import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CATEGORY_LABEL,
  LANG_LABEL,
  PAGE_LANGS,
  PROGRAMMATIC_PAGES,
} from '@/lib/seo/programmatic-pages'

export const metadata: Metadata = {
  title: 'Learn Freestyle Rap — Guides and Practice Tips',
  description:
    'Free guides to practice freestyle rap: beginner how-tos, staying on beat, drills, cyphers, and BPM tips, in English, French, and Portuguese.',
  alternates: { canonical: '/learn' },
  openGraph: {
    type: 'website',
    url: '/learn',
    title: 'Learn Freestyle Rap — Guides and Practice Tips',
    description:
      'Free guides to practice freestyle rap: beginner how-tos, staying on beat, drills, cyphers, and BPM tips, in EN, FR, and PT.',
  },
}

export default function LearnIndexPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-8 sm:pt-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Learn freestyle rap
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
          Practical guides to get better at freestyle: how to start, how to stay
          on beat, drills that work, and how to run a cypher. Then put it into
          practice, free.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {PAGE_LANGS.map((lang) => {
          const pages = PROGRAMMATIC_PAGES.filter((page) => page.lang === lang)
          if (pages.length === 0) return null

          return (
            <section key={lang}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                {LANG_LABEL[lang]}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {pages.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/learn/${page.slug}`}
                    hrefLang={page.lang}
                    className="group rounded-2xl border border-stroke-subtle/40 bg-background-card/40 p-5 transition-colors hover:border-accent-purple/40"
                  >
                    <span className="text-xs font-medium uppercase tracking-wide text-accent-purple">
                      {CATEGORY_LABEL[page.category]}
                    </span>
                    <span className="mt-2 block font-medium leading-snug text-white">
                      {page.h1}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-text-tertiary">
                      {page.description}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-3xl border border-stroke-glow/50 bg-background-card/50 p-7 text-center backdrop-blur-light sm:flex-row">
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
  )
}

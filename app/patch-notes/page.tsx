'use client'

import { PATCH_NOTES } from '@/lib/data/patch-notes'

import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PatchNotesPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-purple-500/30">
      <AppHeader
        showBackButton
        onBack={() => router.back()}
        customTitle="PATCH NOTES"
        customSubtitle="System changelog"
      />

      <main className="pt-24 pb-bottomnav">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Timeline - Shifted right for breathing room (left-6) */}
          <div className="space-y-12 relative before:absolute before:left-6 md:before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-purple-500 before:via-zinc-800 before:to-transparent before:-translate-x-1/2 before:opacity-30">
            {PATCH_NOTES.map((note, index) => (
              <motion.div
                key={`${note.version}-${note.date}-${note.title}-${note.codename}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: index * 0.1 }}
                className="relative z-10"
              >
                {/* Timeline Node - Shifted to match line (left-6) */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-zinc-950 border-2 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] mt-6" />

                <div className="md:grid md:grid-cols-2 md:gap-12 items-start pl-12 md:pl-0">
                  {/* Meta (Left on desktop, Top on mobile) */}
                  <div
                    className={`mb-4 md:mb-0 ${index % 2 === 0 ? 'md:text-right md:pr-4' : 'md:col-start-2 md:pl-4 order-2'}`}
                  >
                    <div className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono mb-2">
                      v{note.version} - {note.date}
                    </div>
                    {/* Max width constraint to prevent overlap with timeline on tiny screens */}
                    <div className="max-w-[calc(100vw-5rem)] md:max-w-none">
                      <h2 className="text-2xl font-bold text-white mb-1 group break-words">
                        {note.title}
                      </h2>
                      <div className="text-purple-400 font-medium text-sm tracking-wide uppercase mb-3">
                        Codename: {note.codename}
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {note.description}
                      </p>
                    </div>
                  </div>

                  {/* Content (Right on desktop, Bottom on mobile) */}
                  <div
                    className={`mt-4 md:mt-0 ${index % 2 === 0 ? 'md:col-start-2 md:pl-4' : 'md:text-right md:pr-4 md:row-start-1'}`}
                  >
                    <div
                      className={`bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5 hover:border-purple-500/30 transition-colors w-full ${index % 2 !== 0 ? 'md:text-left' : ''}`}
                    >
                      {note.changes?.map((category) => (
                        <div key={category.category} className="mb-4 last:mb-0">
                          <h4 className="text-sm font-semibold text-zinc-300 mb-2 border-b border-zinc-800 pb-1 inline-block">
                            {category.category}
                          </h4>
                          <ul className="space-y-1.5">
                            {category.items.map((item, i) => (
                              <li
                                key={i}
                                className="text-sm text-zinc-400 flex items-start gap-2"
                              >
                                <span className="text-purple-500 mt-1.5 text-[6px] shrink-0">
                                  -
                                </span>
                                <span className="break-words">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/profile"
              className="text-zinc-500 hover:text-white text-sm transition-colors"
            >
              {'<-'} Return to Profile
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

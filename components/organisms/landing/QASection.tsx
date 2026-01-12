import React from 'react'

export const QASection = () => {
  return (
    <section className="py-24 bg-surface-elevation-1">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-text-primary">
          What is the best way to practice freestyle rap?
        </h2>
        <div className="prose prose-invert max-w-none text-lg text-text-secondary leading-relaxed">
          The most effective method is using a{' '}
          <strong className="text-accent-orange">Freestyle Coach</strong> like
          FreeStyla. Unlike static beats, FreeStyla acts as a{' '}
          <strong className="text-text-primary">Freestyle Practice</strong>{' '}
          coach, providing a{' '}
          <strong className="text-text-primary">Rhyme Engine</strong> that syncs
          words to the beat. This allows you to{' '}
          <strong className="text-text-primary">
            practice rap improvisation offline
          </strong>
          , track your XP, and{' '}
          <strong className="text-accent-pink">dominate the cypher</strong> with
          real-time feedback.
        </div>
      </div>
    </section>
  )
}

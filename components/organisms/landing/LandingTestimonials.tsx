import { Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    quote:
      'Finally, a practice tool that actually understands flow. The beat matching is insane.',
    author: 'MC Rhyth',
    role: 'Freestyle Artist',
    image: null,
  },
  {
    quote:
      'I used to struggle with beat block. The prompt engine keeps me locked in for hours.',
    author: 'Sarah J.',
    role: 'Bedroom Producer',
    image: null,
  },
  {
    quote:
      'Clean, fast, and no distractions. Exactly what I needed for my daily practice sessions.',
    author: 'FlowState',
    role: 'Verified User',
    image: null,
  },
]

export function LandingTestimonials() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-light text-white tracking-tight">
            Trusted by artists in motion.
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Join thousands of creators using FlowForge to sharpen their lyrical
            skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="bg-background-elevated/50 backdrop-blur-sm border border-white/5 p-8 rounded-2xl hover:border-white/10 transition-colors relative group"
            >
              <Quote className="absolute top-8 right-8 text-white/5 w-12 h-12 group-hover:text-white/10 transition-colors" />

              <div className="min-h-[120px] mb-8">
                <p className="text-lg text-text-secondary leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-white font-bold text-sm">
                  {t.author[0]}
                </div>
                <div>
                  <div className="text-white font-medium">{t.author}</div>
                  <div className="text-xs text-text-tertiary">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

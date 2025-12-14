export function LandingPricing() {
  return (
    <section id="pricing" className="scroll-mt-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-light text-white">Pricing</h2>
        <p className="mt-2 text-text-secondary">Choose the plan that fits your flow</p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-stroke-subtle/40 bg-background-card/40 p-8 backdrop-blur-light">
          <h3 className="text-2xl font-medium text-white">Free</h3>
          <p className="mt-2 text-4xl font-light text-white">
            $0<span className="text-lg text-text-secondary">/month</span>
          </p>
          <ul className="mt-6 space-y-3">
            {['2-minute practice sessions', 'Access to free beats', 'Session history'].map(
              (feature) => (
                <li key={feature} className="flex items-center gap-2 text-text-secondary">
                  <svg
                    className="h-5 w-5 text-accent-green"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{feature}</span>
                </li>
              )
            )}
          </ul>
          <button className="mt-8 w-full rounded-lg border border-stroke-subtle/40 bg-background-card py-3 text-text-primary transition-colors hover:border-accent-blue/40">
            Current Plan
          </button>
        </div>

        <div className="relative rounded-2xl border border-stroke-glow/60 bg-gradient-to-br from-accent-purple/10 via-accent-purple/5 to-accent-violet/10 p-8 backdrop-blur-light shadow-glow">
          <div className="absolute -top-3 right-6 rounded-full bg-accent-purple px-3 py-1 text-xs font-semibold text-black">
            Coming Soon
          </div>
          <h3 className="text-2xl font-medium text-white">Premium</h3>
          <p className="mt-2 text-4xl font-light text-white">
            $4.99<span className="text-lg text-text-secondary">/month</span>
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Unlimited practice sessions',
              'Access to all premium beats',
              'Download recordings',
              'Advanced analytics',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-text-secondary">
                <svg
                  className="h-5 w-5 text-accent-purple"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button
            disabled
            className="btn-primary mt-8 w-full rounded-full bg-gradient-pulse px-8 py-3 text-center text-sm font-semibold text-black shadow-neon transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
          >
            Coming Soon
          </button>
        </div>
      </div>
    </section>
  )
}

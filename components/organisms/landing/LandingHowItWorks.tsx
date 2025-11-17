export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-light text-white">How it Works</h2>
        <p className="mt-2 text-text-secondary">Get started in three simple steps</p>
      </div>

      <div className="grid gap-6 rounded-[2rem] border border-stroke-subtle/40 bg-background-card/40 p-8 text-center text-sm text-text-secondary backdrop-blur-light sm:grid-cols-3 sm:text-left">
        <div className="space-y-2">
          <h3 className="text-base font-medium text-text-primary">1. Choose your beat</h3>
          <p>
            Pick from a curated library of hip‑hop instrumentals, each tagged with BPM and genre so
            you can lock in the right vibe fast.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-medium text-text-primary">2. Configure your session</h3>
          <p>
            Set difficulty and word frequency so prompts match your level—easy warm‑ups or tougher
            vocab every 4, 8, or 16 bars.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-medium text-text-primary">3. Press play & flow</h3>
          <p>
            Hit play to start your 2‑minute run. Words appear on‑beat while FlowForge records, so
            you can review your take and track progress.
          </p>
        </div>
      </div>
    </section>
  )
}

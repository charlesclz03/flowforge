export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-light tracking-tight">
            Flow<span className="text-accent-orange">Forge</span>
          </h1>
          <p className="text-text-secondary text-lg">
            Your AI-powered freestyle rap practice partner
          </p>
        </div>

        <div className="glass rounded-3xl p-8 space-y-6">
          <div className="space-y-2">
            <div className="text-text-secondary text-sm uppercase tracking-wider">Coming Soon</div>
            <p className="text-text-primary">
              Master your flow, sharpen your skills, and unleash your creativity.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-3xl font-light">15+</div>
              <div className="text-text-secondary text-xs">Beats</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-light">∞</div>
              <div className="text-text-secondary text-xs">Words</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-light">24/7</div>
              <div className="text-text-secondary text-xs">Practice</div>
            </div>
          </div>
        </div>

        <div className="text-text-tertiary text-sm">
          <p>Building the future of freestyle practice</p>
        </div>
      </div>
    </main>
  )
}


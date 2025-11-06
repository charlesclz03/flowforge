import Link from 'next/link'
import { Container } from './Container'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-text-tertiary/10 bg-background/80 backdrop-blur-xl safe-top">
      <Container size="full">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-light tracking-tight">
              Flow<span className="text-accent-orange">Forge</span>
            </h1>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Practice
            </Link>
            <Link
              href="/profile"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Sessions
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  )
}

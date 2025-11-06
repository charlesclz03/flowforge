import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-6xl font-light">404</h2>
          <p className="text-text-secondary text-lg">Page not found</p>
        </div>

        <Link href="/" className="btn-primary inline-flex px-8 py-3">
          Go home
        </Link>
      </div>
    </div>
  )
}

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(_req) {
    // If authorized, allow the request
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user has a valid token
        if (token) {
          return true
        }

        // If no token, redirect to sign-in with callback URL
        const signInUrl = new URL('/', req.url)
        signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
        return false // This will trigger redirect
      },
    },
    pages: {
      signIn: '/',
    },
  }
)

export const config = {
  matcher: ['/recordings/:path*', '/review/:path*', '/profile/:path*'],
}

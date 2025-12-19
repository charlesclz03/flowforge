import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id

        // Superadmin Override
        const SUPERADMIN_EMAILS = ['charles.cluzeaud@gmail.com', 'triplyricist@gmail.com']
        if (session.user.email && SUPERADMIN_EMAILS.includes(session.user.email)) {
          // Force active subscription for superadmin
          session.user.subscriptionStatus = 'active'
          session.user.role = 'SUPERADMIN'
        } else {
          // @ts-expect-error - user object from adapter has additional fields
          session.user.subscriptionStatus = user.subscriptionStatus
          // @ts-expect-error - role is custom field
          session.user.role = user.role || 'USER'
        }

        // @ts-expect-error - user object from adapter has additional fields
        session.user.badges = user.badges
        // @ts-expect-error - user object from adapter has additional fields
        session.user.socials = user.socials
        // @ts-expect-error - user object from adapter has additional fields
        session.user.username = user.username
        // @ts-expect-error - user object from adapter has additional fields
        session.user.bio = user.bio
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
}

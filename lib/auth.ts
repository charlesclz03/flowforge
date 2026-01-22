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
  events: {
    async createUser({ user }) {
      // @ts-expect-error - username is a custom field extended in Prisma adapter
      if (user.email && !user.username) {
        // Generate a username from the email slug
        let baseUsername = user.email.split('@')[0].toLowerCase()
        // Sanitize: allow only alphanumeric, underscores, and hyphens
        baseUsername = baseUsername.replace(/[^a-z0-9_-]/g, '')

        // Ensure uniqueness (simple retry mechanism)
        let uniqueUsername = baseUsername
        let counter = 1

        while (true) {
          const existing = await prisma.user.findUnique({
            where: { username: uniqueUsername },
          })
          if (!existing) break

          uniqueUsername = `${baseUsername}${counter}`
          counter++
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { username: uniqueUsername },
        })
      }
    },
    async signIn({ user }) {
      if (!user.email) return

      // SUPERADMIN ENFORCEMENT
      if (user.email === 'charles.cluzeaud@gmail.com') {
        // @ts-expect-error - username is a custom field extended in Prisma adapter
        if (user.username !== 'Admin1') {
          await prisma.user.update({
            where: { id: user.id },
            data: { username: 'Admin1' },
          })
        }
      } else if (user.email === 'triplyricist@gmail.com') {
        // @ts-expect-error - username is a custom field extended in Prisma adapter
        if (user.username !== 'Admin2') {
          await prisma.user.update({
            where: { id: user.id },
            data: { username: 'Admin2' },
          })
        }
      } else {
        // GENERAL BACKFILL for legacy users
        // @ts-expect-error - username is a custom field
        if (!user.username) {
          let baseUsername = user.email.split('@')[0].toLowerCase()
          baseUsername = baseUsername.replace(/[^a-z0-9_-]/g, '')

          let uniqueUsername = baseUsername
          let counter = 1

          while (true) {
            const existing = await prisma.user.findUnique({
              where: { username: uniqueUsername },
            })
            if (!existing) break

            uniqueUsername = `${baseUsername}${counter}`
            counter++
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { username: uniqueUsername },
          })
        }
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Ensure profile image from OAuth is passed to session
        session.user.image = user.image

        // Superadmin Override
        const SUPERADMIN_EMAILS = [
          'charles.cluzeaud@gmail.com',
          'triplyricist@gmail.com',
        ]
        if (
          session.user.email &&
          SUPERADMIN_EMAILS.includes(session.user.email)
        ) {
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
        session.user.socials = user.socials
        // @ts-expect-error - user object from adapter has additional fields
        session.user.username = user.username
        // @ts-expect-error - user object from adapter has additional fields
        session.user.bio = user.bio

        // Fetch latest streak & stats from DB to ensure accuracy
        const latestUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            currentStreak: true,
            xp: true,
            level: true,
          },
        })
        if (latestUser) {
          session.user.currentStreak = latestUser.currentStreak
          session.user.xp = latestUser.xp
          session.user.level = latestUser.level
        }
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

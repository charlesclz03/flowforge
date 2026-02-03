import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

function getSuperadminEmailAllowlist(): Set<string> {
  const allowlist = new Set<string>()

  const rawList = process.env.SUPERADMIN_EMAILS
  if (rawList) {
    rawList
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
      .forEach((e) => allowlist.add(e))
  }

  // Back-compat (deprecated): single admin email
  const legacyAdmin = process.env.ADMIN_EMAIL
  if (legacyAdmin) allowlist.add(legacyAdmin.trim().toLowerCase())

  return allowlist
}

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

      const allowlist = getSuperadminEmailAllowlist()
      const email = user.email.toLowerCase()

      // Bootstrap SUPERADMIN role from server-side allowlist (transitional)
      if (allowlist.has(email) && user.role !== 'SUPERADMIN') {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'SUPERADMIN' },
        })
      }

      // GENERAL BACKFILL for legacy users
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
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Ensure profile image from OAuth is passed to session
        session.user.image = user.image

        // Fetch latest profile + role/subscription from DB to ensure accuracy
        const latestUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            subscriptionStatus: true,
            role: true,
            socials: true,
            username: true,
            bio: true,
            currentStreak: true,
            xp: true,
            level: true,
          },
        })
        if (latestUser) {
          session.user.subscriptionStatus = latestUser.subscriptionStatus
          session.user.role = latestUser.role
          session.user.socials = latestUser.socials
          session.user.username = latestUser.username
          session.user.bio = latestUser.bio
          session.user.currentStreak = latestUser.currentStreak
          session.user.xp = latestUser.xp
          session.user.level = latestUser.level
        } else {
          session.user.subscriptionStatus = user.subscriptionStatus ?? null
          session.user.role = user.role || 'USER'
          session.user.socials = user.socials
          session.user.username = user.username ?? null
          session.user.bio = user.bio ?? null
        }

        // Superadmin Override (transitional allowlist)
        if (session.user.email) {
          const allowlist = getSuperadminEmailAllowlist()
          if (allowlist.has(session.user.email.toLowerCase())) {
            session.user.subscriptionStatus = 'active'
            session.user.role = 'SUPERADMIN'
          }
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

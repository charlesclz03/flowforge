import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { resolveUniqueUsername } from '@/lib/auth/username'

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

function resolveNextAuthDebug(): boolean {
  const raw = process.env.NEXTAUTH_DEBUG?.trim().toLowerCase()
  if (raw === 'true') return true
  if (raw === 'false') return false
  return process.env.NODE_ENV === 'development'
}

function getGoogleProfileImage(profile: unknown): string | null {
  if (!profile || typeof profile !== 'object') return null

  const p = profile as Record<string, unknown>
  const candidates = [p.picture, p.image, p.avatar_url]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }

  return null
}

function canBackfillOAuthImage(
  currentImage: string | null | undefined
): boolean {
  if (!currentImage) return true
  const trimmed = currentImage.trim()
  if (!trimmed) return true

  // Preserve explicitly uploaded custom avatars.
  if (trimmed.startsWith('/api/avatars/')) {
    return false
  }

  return false
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
        const uniqueUsername = await resolveUniqueUsername(
          user.email.split('@')[0],
          user.id
        )

        await prisma.user.update({
          where: { id: user.id },
          data: { username: uniqueUsername },
        })
      }
    },
    async signIn({ user, account, profile }) {
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
        const uniqueUsername = await resolveUniqueUsername(
          user.email.split('@')[0],
          user.id
        )

        await prisma.user.update({
          where: { id: user.id },
          data: { username: uniqueUsername },
        })
      }

      // Backfill missing avatar from Google profile payload for legacy users.
      if (account?.provider === 'google') {
        const googleImage = getGoogleProfileImage(profile)
        if (googleImage && canBackfillOAuthImage(user.image)) {
          await prisma.user.update({
            where: { id: user.id },
            data: { image: googleImage },
          })
          user.image = googleImage
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

        // Fetch latest profile + role/subscription from DB to ensure accuracy
        const latestUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            subscriptionStatus: true,
            role: true,
            socials: true,
            username: true,
            bio: true,
            profileSetupCompletedAt: true,
            image: true,
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
          session.user.profileSetupCompletedAt =
            latestUser.profileSetupCompletedAt?.toISOString() ?? null
          session.user.image = latestUser.image ?? session.user.image
          session.user.currentStreak = latestUser.currentStreak
          session.user.xp = latestUser.xp
          session.user.level = latestUser.level
        } else {
          session.user.subscriptionStatus = user.subscriptionStatus ?? null
          session.user.role = user.role || 'USER'
          session.user.socials = user.socials
          session.user.username = user.username ?? null
          session.user.bio = user.bio ?? null
          session.user.profileSetupCompletedAt =
            user.profileSetupCompletedAt?.toISOString() ?? null
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
  debug: resolveNextAuthDebug(),
}

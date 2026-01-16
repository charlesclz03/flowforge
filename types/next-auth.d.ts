import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      subscriptionStatus?: string | null
      role?: string
      socials?: unknown
      username?: string | null
      bio?: string | null
      currentStreak?: number
      xp?: number
      level?: number
    } & DefaultSession['user']
  }
}

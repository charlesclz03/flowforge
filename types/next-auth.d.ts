import { DefaultSession, DefaultUser } from 'next-auth'

type UserRole = 'USER' | 'SUPERADMIN' | (string & {})
type SubscriptionStatus =
  | 'free'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'trialing'
  | (string & {})

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      subscriptionStatus?: SubscriptionStatus | null
      role?: UserRole
      socials?: unknown
      username?: string | null
      bio?: string | null
      currentStreak?: number
      xp?: number
      level?: number
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    subscriptionStatus?: SubscriptionStatus | null
    role?: UserRole
    socials?: unknown
    username?: string | null
    bio?: string | null
    currentStreak?: number
    xp?: number
    level?: number
  }
}

declare module 'next-auth/adapters' {
  interface AdapterUser {
    subscriptionStatus?: SubscriptionStatus | null
    role?: UserRole
    socials?: unknown
    username?: string | null
    bio?: string | null
    currentStreak?: number
    xp?: number
    level?: number
  }
}

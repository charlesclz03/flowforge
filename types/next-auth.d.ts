import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      subscriptionStatus?: string | null
      role?: string
      badges?: string[]
      socials?: any
      username?: string | null
      bio?: string | null
    } & DefaultSession['user']
  }
}

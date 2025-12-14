import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      subscriptionStatus?: string | null
      badges?: string[]
      socials?: any
    } & DefaultSession['user']
  }
}

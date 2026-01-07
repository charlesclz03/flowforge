import { User } from '@prisma/client'

export function isUserPremium(user?: User | null) {
  if (!user) return false

  const validStatuses = ['active', 'trialing']
  return validStatuses.includes(user.subscriptionStatus || '')
}

export function canAccessBeat(
  user: User | null | undefined,
  beatIsPremium: boolean
) {
  if (!beatIsPremium) return true
  return isUserPremium(user)
}

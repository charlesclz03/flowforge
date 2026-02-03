import { prisma } from '@/lib/prisma'
import { isProUser } from '@/lib/subscription/isPro'

export async function checkSubscription(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true, role: true },
  })

  // Check for active or trialing status
  return isProUser(user ?? undefined)
}

export async function requirePro(userId: string) {
  const isPro = await checkSubscription(userId)

  if (!isPro) {
    throw new Error('Pro subscription required')
  }
}

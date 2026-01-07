import { prisma } from '@/lib/prisma'

export async function checkSubscription(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true },
  })

  // Check for active or trialing status
  return (
    user?.subscriptionStatus === 'active' ||
    user?.subscriptionStatus === 'trialing'
  )
}

export async function requirePro(userId: string) {
  const isPro = await checkSubscription(userId)

  if (!isPro) {
    throw new Error('Pro subscription required')
  }
}

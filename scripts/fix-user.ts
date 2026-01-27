import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const targetEmail = 'karl.banks0369@gmail.com'
  
  console.log(`🔍 Upgrading user to PRO: ${targetEmail}`)
  
  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
  })

  if (!user) {
    console.log('❌ User not found.')
    return
  }

  console.log(`👤 Found user: ${user.username} (Current Status: ${user.subscriptionStatus})`)

  const updated = await prisma.user.update({
    where: { email: targetEmail },
    data: {
      role: 'USER',
      subscriptionStatus: 'active', // 'active' = Pro
    },
  })

  console.log('✅ User upgraded successfully:')
  console.log(`   - Username: ${updated.username}`)
  console.log(`   - Role: ${updated.role}`)
  console.log(`   - Subscription: ${updated.subscriptionStatus}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

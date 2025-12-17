import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')

  // 1. Create a Beat
  const beat = await prisma.beat.upsert({
    where: { id: 'test-beat-1' },
    update: {},
    create: {
      id: 'test-beat-1',
      title: 'Neon Nights',
      bpm: 90,
      storageUrl: 'https://example.com/beat.mp3', // Dummy URL
      difficulty: 'Medium',
    },
  })
  console.log({ beat })

  // 2. Create a User
  const user = await prisma.user.upsert({
    where: { email: 'flowmaster@example.com' },
    update: {},
    create: {
      email: 'flowmaster@example.com',
      username: 'FlowMaster',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FlowMaster',
    },
  })
  console.log({ user })

  // 3. Create a Session
  const session = await prisma.freestyleSession.create({
    data: {
      userId: user.id,
      beatId: beat.id,
      title: 'Late Night Flow',
      storageUrl: 'https://example.com/flow.mp3', // Dummy URL
      durationSeconds: 30,
    },
  })
  console.log({ session })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

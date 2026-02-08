
import { prisma } from '../lib/prisma'

async function checkLatestRecordings() {
  try {
    const recordings = await prisma.freestyleSession.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            email: true,
            subscriptionStatus: true,
          }
        }
      }
    })

    console.log('--- LATEST 5 RECORDINGS ---')
    recordings.forEach(r => {
      console.log(`ID: ${r.id}`)
      console.log(`Date: ${r.createdAt.toISOString()}`)
      console.log(`User: ${r.user.email} (${r.user.subscriptionStatus})`)
      console.log(`Title: ${r.title}`)
      console.log(`Size: ${r.fileSizeBytes}`)
      console.log('---------------------------')
    })
  } catch (error) {
    console.error('Error querying recordings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLatestRecordings()

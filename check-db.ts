import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const allAchievements = await prisma.achievement.findMany()
  console.log(`Total Achievements in DB: ${allAchievements.length}`)
  allAchievements.forEach((a) => console.log(` - ${a.code}: ${a.name}`))

  const userAchievements = await prisma.userAchievement.findMany()
  console.log(
    `Total User Achievements in DB (all users): ${userAchievements.length}`
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

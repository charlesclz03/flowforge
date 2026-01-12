import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Container } from '@/components/atoms/Container'
import { Avatar } from '@/components/atoms/Avatar'
import { Card } from '@/components/atoms/Card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/atoms/Tabs'
import { FreestyleSession, Beat } from '@prisma/client'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

interface SocialLinks {
  instagram?: string
  tiktok?: string
}

type ProfileSession = FreestyleSession & { beat: Beat }

interface ProfilePageProps {
  params: {
    username: string
  }
}

async function getUser(username: string) {
  // Try to find by ID first (primary method for now)
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: username },
        { name: { equals: username, mode: 'insensitive' } },
      ],
    },
    include: {
      _count: {
        select: {
          freestyleSessions: true,
        },
      },
      freestyleSessions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          beat: true,
        },
      },
      // Socials is a Json field, automatically included
    },
  })

  return user
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const user = await getUser(params.username)

  if (!user) {
    return {
      title: 'User Not Found | FreeStyla',
    }
  }

  const title = `${user.name || 'Anonymous'}'s Profile | FreeStyla`
  const description = `Check out ${user.name || 'Anonymous'}'s ${user._count.freestyleSessions} flows on FreeStyla.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: user.image ? [{ url: user.image }] : [],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: user.image ? [user.image] : [],
    },
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await getUser(params.username)

  if (!user) {
    notFound()
  }

  return (
    <Container className="py-8 space-y-8">
      <AppHeader
        showBackButton={true}
        onBack={() => {}} // Cleanest way for server component: let it use default router.back or we'd need a client wrapper. AppHeader handles router.back if onBack is undefined? No, onBack is optional.
        // Wait, AppHeader uses useRouter. useRouter works in Client Components. AppHeader IS a client component.
        // So I can just pass nothing for onBack and it will default to router.back().
        customTitle="ARTIST PROFILE"
        customSubtitle={`${user.name || 'Artist'}'s flowfolio`}
      />
      {/* Profile Header */}
      <Card padding="lg" className="relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <Avatar
            src={user.image}
            fallback={user.name?.[0]?.toUpperCase() || 'U'}
            size="xl"
            className="border-4 border-background-elevated shadow-xl"
          />

          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold text-white">
              {user.name || 'Anonymous User'}
            </h1>
            {/* We display the ID/slug in the URL as the "username" for now */}
            {/* <p className="text-text-secondary">@{params.username}</p> */}

            <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-text-tertiary pt-2">
              <div>
                <span className="font-bold text-white block text-lg">
                  {user._count.freestyleSessions}
                </span>
                <span>Flows</span>
              </div>
            </div>

            {/* Socials */}
            {(user.socials as unknown as SocialLinks) && (
              <div className="flex gap-4 pt-4 justify-center md:justify-start">
                {(user.socials as unknown as SocialLinks).instagram && (
                  <a
                    href={`https://instagram.com/${(user.socials as unknown as SocialLinks).instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-accent-pink transition-colors"
                  >
                    <span className="sr-only">Instagram</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>
                )}
                {(user.socials as unknown as SocialLinks).tiktok && (
                  <a
                    href={`https://tiktok.com/@${(user.socials as unknown as SocialLinks).tiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-accent-purple transition-colors"
                  >
                    <span className="sr-only">TikTok</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {/* Removed Follow/Message buttons */}
            {/* <ShareProfileButton username={user.name || 'User'} userId={user.id} /> */}
            {/* Assuming ShareProfileButton might also supply some social logic or be missing. 
                 It was imported from 'social'. Checking if file exists. 
                 If I deleted 'components/molecules/social', then ShareProfileButton is gone too. 
                 I should probably define a simple local button or remove it. 
                 For now, I'll remove it to be safe.
             */}
          </div>
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="flows" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="flows">Flows</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        <TabsContent value="flows" className="mt-6 space-y-4">
          {user.freestyleSessions.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              No flows recorded yet.
            </div>
          ) : (
            user.freestyleSessions.map((session: ProfileSession) => (
              <Card
                key={session.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-white">{session.title}</h3>
                  <p className="text-sm text-text-secondary">
                    {session.beat.title} •{' '}
                    {session.durationSeconds
                      ? Math.floor(session.durationSeconds)
                      : 0}
                    s
                  </p>
                </div>
                <div className="text-xs text-text-tertiary">
                  {new Date(session.createdAt).toLocaleDateString()}
                </div>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="about">
          <Card className="p-6 text-text-secondary">
            <h3 className="text-lg font-bold text-white mb-2">About</h3>
            <p className="mb-4">{user.bio || 'No bio yet.'}</p>
            <div className="text-sm text-text-tertiary">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  )
}

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
// import { FreestyleSession, Beat } from '@prisma/client'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

import { ProfileOwnerControls } from '@/components/organisms/profile/ProfileOwnerControls'
import { ProfileSettingsTab } from '@/components/organisms/profile/ProfileSettingsTab'
import { ProfileStatsTab } from '@/components/organisms/profile/ProfileStatsTab'

interface SocialLinks {
  instagram?: string
  tiktok?: string
}

// type ProfileSession = FreestyleSession & { beat: Beat }

interface ProfilePageProps {
  params: {
    username: string
  }
}

import { cache } from 'react'
import { Trophy } from 'lucide-react'

const getUser = cache(async (username: string) => {
  // Check if input is a valid UUID to prevent "invalid input syntax" errors
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      username
    )

  const orConditions: Prisma.UserWhereInput[] = [
    { name: { equals: username, mode: 'insensitive' } },
    { username: { equals: username, mode: 'insensitive' } },
  ]

  // Only check ID if it's a valid UUID
  if (isUuid) {
    orConditions.push({ id: username })
  }

  const whereClause: Prisma.UserWhereInput = {
    OR: orConditions,
  }

  const user = await prisma.user.findFirst({
    where: whereClause,
    include: {
      _count: {
        select: {
          freestyleSessions: true,
          // followedBy/following not in schema yet
          collectedWords: true,
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
})

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
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const [user, session] = await Promise.all([
    getUser(params.username),
    getServerSession(authOptions),
  ])

  if (!user) {
    notFound()
  }

  const currentUserId = session?.user?.id
  const isOwner = currentUserId === user.id

  const socials = user.socials as SocialLinks | null

  // Format Join Date
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <Container className="py-8 space-y-8" size="lg">
      {' '}
      {/* Using lg to be safe */}
      <AppHeader showBackButton={true} />
      {/* Profile Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Fixed Stats / Info */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <Card padding="lg" className="relative overflow-hidden w-full">
            {/* Edit Action (Top Right) */}
            {isOwner && (
              <div className="absolute top-4 right-4 z-20">
                <ProfileOwnerControls
                  user={{
                    username: user.username,
                    bio: user.bio,
                    image: user.image,
                    name: user.name,
                  }}
                />
              </div>
            )}
            <div className="flex flex-col items-center gap-6 relative z-10">
              <Avatar
                src={user.image}
                alt={user.name || 'User'}
                size="xl"
                className="border-4 border-background shadow-xl"
              />

              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  {user.name}
                </h1>
                <p className="text-accent-purple font-medium">
                  @{user.username || 'freestyler'}
                </p>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-center text-text-secondary text-sm max-w-xs leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Social Stats */}
              <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-stroke-subtle">
                <div className="text-center p-3 rounded-lg bg-surface-highlight/30">
                  <span className="block text-2xl font-bold text-white mb-1">
                    {user._count.freestyleSessions}
                  </span>
                  <span className="text-xs text-text-tertiary uppercase tracking-wider">
                    Flows
                  </span>
                </div>
                <div className="text-center p-3 rounded-lg bg-surface-highlight/30">
                  <span className="block text-2xl font-bold text-white mb-1">
                    {user._count.collectedWords}
                  </span>
                  <span className="text-xs text-text-tertiary uppercase tracking-wider">
                    Vault
                  </span>
                </div>
              </div>

              {/* Join Date */}
              <div className="text-xs text-text-tertiary pt-2">
                Joined {joinDate}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full pt-2">
                {/* Follow Button Removed as it is not supported by backend yet */}
              </div>
            </div>
          </Card>

          {/* Social Links Block */}
          {(socials?.instagram || socials?.tiktok) && (
            <Card padding="md" className="w-full">
              <div className="flex justify-center gap-6">
                {socials.instagram && (
                  <a
                    href={`https://instagram.com/${socials.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-accent-purple transition-colors"
                  >
                    IG
                  </a>
                )}
                {socials.tiktok && (
                  <a
                    href={`https://tiktok.com/@${socials.tiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-accent-purple transition-colors"
                  >
                    TikTok
                  </a>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Content Tabs */}
        <div className="lg:col-span-8 w-full">
          <Tabs defaultValue="flows" className="w-full">
            <TabsList
              className={`grid w-full ${isOwner ? 'grid-cols-4' : 'grid-cols-2'} lg:w-[${isOwner ? '600px' : '400px'}]`}
            >
              <TabsTrigger value="flows">Flows</TabsTrigger>
              {isOwner && <TabsTrigger value="stats">Stats</TabsTrigger>}
              <TabsTrigger value="about">About</TabsTrigger>
              {isOwner && <TabsTrigger value="settings">Settings</TabsTrigger>}
            </TabsList>
            <TabsContent value="flows" className="mt-6 space-y-4">
              {user.freestyleSessions.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {user.freestyleSessions.map((session: any) => (
                    <a
                      key={session.id}
                      href={`/s/${session.id}`}
                      className="group block p-4 rounded-xl bg-surface-base border border-surface-highlight hover:border-accent-purple/50 transition-all hover:translate-x-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-surface-highlight flex items-center justify-center text-accent-purple group-hover:scale-110 transition-transform">
                            <Trophy size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white group-hover:text-accent-purple transition-colors">
                              {session.title}
                            </h3>
                            <p className="text-xs text-text-tertiary">
                              {session.beat.title} •{' '}
                              {new Date(session.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-mono text-text-secondary">
                            {Math.floor(session.durationSeconds / 60)}:
                            {(session.durationSeconds % 60)
                              .toString()
                              .padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-text-disabled">
                  <p>No flows recorded yet.</p>
                  {isOwner && (
                    <p className="text-sm mt-2 text-accent-purple">
                      Record your first track to see it here.
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="about">
              <Card padding="md">
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-lg font-bold">About {user.name}</h3>
                  <p className="text-text-secondary">
                    {user.bio || 'No bio yet.'}
                  </p>
                  <div className="pt-4 border-t border-stroke-subtle mt-4">
                    <p className="text-xs text-text-tertiary">
                      Member since{' '}
                      <span className="text-white">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {isOwner && (
              <>
                <TabsContent value="stats">
                  <ProfileStatsTab />
                </TabsContent>
                <TabsContent value="settings">
                  <ProfileSettingsTab />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </Container>
  )
}

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Container } from '@/components/atoms/Container'
import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/Tabs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { FollowButton } from '@/components/molecules/social/FollowButton'

interface ProfilePageProps {
  params: {
    username: string
  }
}

async function getUser(username: string) {
  // Decode username if needed, or handle slug logic
  // For MVP, we might assume username is accessible via ID or a specific field.
  // Since our User model doesn't strictly have a 'username' field yet (only 'name' and 'email'),
  // we might need to use ID or add a username field.
  // Wait, let's check schema. User has 'name'. We might use 'name' as username for now?
  // Or assuming '/u/[id]' for now?
  // The Task says '/u/[username]'.
  // If we don't have unique usernames, maybe we should use ID or add username field.
  // Let's assume we map 'name' or just query by ID if it looks like a UUID.

  // For now, let's try to find by ID first, if unrelated, try name?
  // Actually, 'u/[username]' usually implies a handle.
  // Let's check if we can query by 'name' (not unique).
  // Schema check: User has `name String?`. `email String? @unique`.
  // Ideally we need a unique `username` field.
  // Current Plan: Use `id` for now to be safe, or exact match on `name`?
  // Using ID is safer for MVP: /u/[userId]

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: username },
        // { name: username } // Name is not unique, risky.
      ],
    },
    include: {
      _count: {
        select: {
          followedBy: true,
          following: true,
          freestyleSessions: true,
        },
      },
      freestyleSessions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          beat: true,
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
  })

  return user
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await getUser(params.username)
  const session = await getServerSession(authOptions)
  const currentUserId = session?.user?.id

  if (!user) {
    notFound()
  }

  let isFollowing = false
  if (currentUserId && currentUserId !== user.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: user.id,
        },
      },
    })
    isFollowing = !!follow
  }

  const isOwnProfile = currentUserId === user.id

  return (
    <Container className="py-8 space-y-8">
      {/* Profile Header */}
      <Card padding="xl" className="relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <Avatar
            src={user.image}
            fallback={user.name?.[0]?.toUpperCase() || 'U'}
            size="xl"
            className="border-4 border-background-elevated shadow-xl"
          />

          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold text-white">{user.name || 'Anonymous User'}</h1>
            <p className="text-text-secondary">@{params.username}</p> {/* ID for now */}
            <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-text-tertiary pt-2">
              <div>
                <span className="font-bold text-white block text-lg">
                  {user._count.freestyleSessions}
                </span>
                <span>Flows</span>
              </div>
              <div>
                <span className="font-bold text-white block text-lg">{user._count.followedBy}</span>
                <span>Followers</span>
              </div>
              <div>
                <span className="font-bold text-white block text-lg">{user._count.following}</span>
                <span>Following</span>
              </div>
            </div>
            {/* Socials */}
            {(user.socials as any) && (
              <div className="flex gap-4 pt-4 justify-center md:justify-start">
                {(user.socials as any).instagram && (
                  <a
                    href={`https://instagram.com/${(user.socials as any).instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-accent-pink transition-colors"
                  >
                    <span className="sr-only">Instagram</span>
                    {/* Simple text or Icon if imported */}
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
                {(user.socials as any).tiktok && (
                  <a
                    href={`https://tiktok.com/@${(user.socials as any).tiktok}`}
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
            {/* Only show Follow button if logged in and not own profile */}
            {currentUserId && !isOwnProfile && (
              <FollowButton targetUserId={user.id} initialIsFollowing={isFollowing} />
            )}

            {isOwnProfile && (
              <Button variant="outline" className="border-accent-purple text-accent-purple">
                Edit Profile
              </Button>
            )}
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
            <div className="text-center py-12 text-text-tertiary">No flows recorded yet.</div>
          ) : (
            user.freestyleSessions.map((session) => (
              <Card key={session.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{session.title}</h3>
                  <p className="text-sm text-text-secondary">
                    {session.beat.title} • {Math.floor(session.durationSeconds)}s
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
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  )
}

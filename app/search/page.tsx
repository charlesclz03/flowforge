import { prisma } from '@/lib/prisma'
import { Container } from '@/components/atoms/Container'
import { PageHeader } from '@/components/organisms/common'
import { SearchInput } from '@/components/organisms/search/SearchInput'
import { Avatar } from '@/components/atoms/Avatar'
import Link from 'next/link'
import { Play } from 'lucide-react'

// Reusing beat/user styling or components if available,
// but creating simple lists for now to ensure speed.

async function search(query: string) {
  if (!query) return { beats: [], users: [] }

  const [beats, users] = await Promise.all([
    prisma.beat.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { artistName: { contains: query, mode: 'insensitive' } },
          { genre: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    }),
  ])

  return { beats, users }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ''
  const { beats, users } = await search(query)

  return (
    <div className="min-h-screen bg-background pb-20 pt-8">
      <Container className="space-y-8">
        <div className="flex flex-col items-center space-y-6">
          <PageHeader
            title="Search"
            description="Find the perfect beat or connect with other emcees."
          />
          <SearchInput />
        </div>

        {query && (
          <div className="space-y-12">
            {/* Beats Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white pl-1">Beats</h2>
              {beats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {beats.map((beat) => (
                    <Link key={beat.id} href={`/practice?beatId=${beat.id}`}>
                      <div className="group bg-background-elevated hover:bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Play className="w-5 h-5 text-accent-cyan fill-current" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white group-hover:text-accent-cyan transition-colors">
                              {beat.title}
                            </h3>
                            <p className="text-sm text-text-tertiary">
                              {beat.artistName} • {beat.bpm} BPM
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-text-tertiary italic">
                  No beats found matching "{query}".
                </p>
              )}
            </section>

            {/* Users Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white pl-1">Users</h2>
              {users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map((user) => (
                    <Link key={user.id} href={`/u/${user.id}`}>
                      {/* Using ID for now as per Profile Page logic */}
                      <div className="group bg-background-elevated hover:bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4 transition-colors">
                        <Avatar
                          src={user.image}
                          fallback={user.name?.[0] || 'U'}
                        />
                        <div>
                          <h3 className="font-bold text-white group-hover:text-accent-purple transition-colors">
                            {user.name || 'Anonymous'}
                          </h3>
                          <p className="text-xs text-text-tertiary">
                            @{user.username || 'user'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-text-tertiary italic">
                  No users found matching "{query}".
                </p>
              )}
            </section>
          </div>
        )}
      </Container>
    </div>
  )
}

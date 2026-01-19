import { prisma } from '@/lib/prisma'
import { AppHeader } from '@/components/organisms/layout/AppHeader'
import { Container } from '@/components/atoms/Container'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, Star, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      _count: {
        select: {
          sessions: true,
          freestyleSessions: true,
          achievements: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <AppHeader
          customTitle="USER MANAGEMENT"
          customSubtitle="All registered members"
        />
      </div>

      <Container>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-text-secondary text-sm">
                <th className="p-4">User</th>
                <th className="p-4">Status</th>
                <th className="p-4">Stats</th>
                <th className="p-4">Activity</th>
                <th className="p-4">Engagement</th>
                <th className="p-4">ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar fallback if no component */}
                      <div className="w-10 h-10 rounded-full bg-surface-elevation-2 overflow-hidden relative">
                        {user.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={user.image}
                            alt={user.name || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-accent-purple/20 text-accent-purple font-bold">
                            {(
                              user.name?.[0] ||
                              user.email?.[0] ||
                              '?'
                            ).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {user.name || 'No Name'}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {user.email}
                        </div>
                        {user.username && (
                          <div className="text-xs text-accent-cyan">
                            @{user.username}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                          user.role === 'SUPERADMIN'
                            ? 'bg-accent-red/10 text-accent-red border-accent-red/20'
                            : 'bg-surface-elevation-2 text-text-secondary border-transparent'
                        }`}
                      >
                        {user.role}
                      </span>
                      {user.subscriptionStatus === 'active' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold border bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20 flex items-center gap-1">
                          <Zap size={10} /> PRO
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-xs">
                          Level
                        </span>
                        <span className="font-bold">{user.level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-xs">XP</span>
                        <span className="font-mono text-accent-purple">
                          {user.xp}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm space-y-1">
                      <div className="text-white">
                        Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </div>
                      {user.lastPracticeDate && (
                        <div className="text-xs text-text-secondary">
                          Last:{' '}
                          {format(
                            new Date(user.lastPracticeDate),
                            'MMM d, h:mm a'
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold">
                          {user._count.freestyleSessions}
                        </div>
                        <div className="text-[10px] text-text-secondary">
                          Recs
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{user._count.sessions}</div>
                        <div className="text-[10px] text-text-secondary">
                          Sess
                        </div>
                      </div>
                      {user.hasRated && (
                        <div className="text-accent-yellow" title="Rated App">
                          <Star size={16} fill="currentColor" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <code
                      className="text-[10px] bg-black/20 p-1 rounded font-mono text-text-secondary block w-24 truncate"
                      title={user.id}
                    >
                      {user.id}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  )
}

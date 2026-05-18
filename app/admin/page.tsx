import Link from 'next/link'
import { UploadCloud, Music, Users, MessageSquare } from 'lucide-react'
import { Card } from '@/components/atoms/Card'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <AppHeader customTitle="ADMIN PANEL" customSubtitle="System management" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/beats/new"
          className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Card className="min-h-[168px] p-6 hover:border-accent-purple transition-colors cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-accent-purple/20 text-accent-purple motion-safe:group-hover:scale-105 transition-transform">
                <UploadCloud size={24} />
              </div>
              <h2 className="text-xl font-bold">Upload Beat</h2>
            </div>
            <p className="text-text-secondary">
              Add new instrumentals to the library. Auto-transcodes and sets up
              metadata.
            </p>
          </Card>
        </Link>

        <Link
          href="/admin/beats"
          className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Card className="min-h-[168px] p-6 hover:border-accent-cyan transition-colors cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-accent-cyan/20 text-accent-cyan motion-safe:group-hover:scale-105 transition-transform">
                <Music size={24} />
              </div>
              <h2 className="text-xl font-bold">Manage Library</h2>
            </div>
            <p className="text-text-secondary">
              Edit, delete, or feature existing beats.
            </p>
          </Card>
        </Link>

        <Link
          href="/admin/users"
          className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Card className="min-h-[168px] p-6 hover:border-accent-pink transition-colors cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-accent-pink/20 text-accent-pink motion-safe:group-hover:scale-105 transition-transform">
                <Users size={24} />
              </div>
              <h2 className="text-xl font-bold">Users</h2>
            </div>
            <p className="text-text-secondary">
              View all user accounts, stats, and subscription status.
            </p>
          </Card>
        </Link>

        <Link
          href="/admin/feedback"
          className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Card className="min-h-[168px] p-6 hover:border-accent-yellow transition-colors cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-accent-yellow/20 text-accent-yellow motion-safe:group-hover:scale-105 transition-transform">
                <MessageSquare size={24} />
              </div>
              <h2 className="text-xl font-bold">Feedback</h2>
            </div>
            <p className="text-text-secondary">
              View user bug reports and suggestions.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  )
}

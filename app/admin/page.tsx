import Link from 'next/link'
import { UploadCloud, Music, Users } from 'lucide-react'
import { Card } from '@/components/atoms/Card'

export default function AdminPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link href="/admin/beats/new">
        <Card className="p-6 hover:border-accent-purple transition-all cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-accent-purple/20 text-accent-purple group-hover:scale-110 transition-transform">
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

      <Link href="/admin/beats">
        <Card className="p-6 hover:border-accent-cyan transition-all cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-accent-cyan/20 text-accent-cyan group-hover:scale-110 transition-transform">
              <Music size={24} />
            </div>
            <h2 className="text-xl font-bold">Manage Library</h2>
          </div>
          <p className="text-text-secondary">
            Edit, delete, or feature existing beats.
          </p>
        </Card>
      </Link>

      <Card className="p-6 opacity-50 cursor-not-allowed">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-full bg-accent-pink/20 text-accent-pink">
            <Users size={24} />
          </div>
          <h2 className="text-xl font-bold">Users</h2>
        </div>
        <p className="text-text-secondary">User management coming soon.</p>
      </Card>
    </div>
  )
}

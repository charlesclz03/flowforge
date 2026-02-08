import { isSuperAdmin } from '@/lib/auth/admin'
import { notFound } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isSuperAdmin())) {
    notFound()
  }

  return <div className="min-h-screen bg-background text-white">{children}</div>
}

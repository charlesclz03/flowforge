import { isSuperAdmin } from '@/lib/auth/admin'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isSuperAdmin())) {
    redirect('/')
  }

  return <div className="min-h-screen bg-background text-white">{children}</div>
}

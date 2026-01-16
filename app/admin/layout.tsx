import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const adminEmail = process.env.ADMIN_EMAIL

  const isSuperAdmin = session?.user?.role === 'SUPERADMIN'
  const isEmailAdmin = session?.user?.email === adminEmail

  if (!session || (!isSuperAdmin && !isEmailAdmin)) {
    redirect('/')
  }

  return <div className="min-h-screen bg-background text-white">{children}</div>
}

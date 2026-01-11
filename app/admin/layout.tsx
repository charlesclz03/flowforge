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

  if (!session || !session.user?.email || session.user.email !== adminEmail) {
    redirect('/')
  }

  return <div className="min-h-screen bg-background text-white">{children}</div>
}

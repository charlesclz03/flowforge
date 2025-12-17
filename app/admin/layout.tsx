import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const adminEmail = process.env.ADMIN_EMAIL

  if (!session || !session.user?.email || session.user.email !== adminEmail) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-purple to-accent-cyan bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-text-secondary">Super Admin Context: {session.user.email}</p>
        </div>
        {children}
      </main>
    </div>
  )
}

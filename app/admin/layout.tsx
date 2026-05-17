import { getServerSession } from 'next-auth'
import { verifySuperAdmin } from '@/lib/auth/admin'
import { authOptions } from '@/lib/auth'
import { buildSignInRedirect } from '@/lib/auth/require-user-session'
import { notFound, redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(buildSignInRedirect('/admin'))
  }

  try {
    await verifySuperAdmin()
  } catch {
    notFound()
  }

  return <div className="min-h-screen bg-background text-white">{children}</div>
}

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/')
  }

  // Redirect to their definitive profile URL
  const identifier = session.user.username || session.user.id
  redirect(`/u/${identifier}`)
}

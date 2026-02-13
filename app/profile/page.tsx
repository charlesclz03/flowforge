import { redirect } from 'next/navigation'
import { requireUserSession } from '@/lib/auth/require-user-session'

export default async function ProfilePage() {
  const session = await requireUserSession('/profile')

  // Redirect to their definitive profile URL
  const identifier = session.user.username || session.user.id
  redirect(`/u/${identifier}`)
}

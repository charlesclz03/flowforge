import { requireCompletedUserSession } from '@/lib/auth/require-user-session'

export default async function RecordingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireCompletedUserSession('/recordings')
  return <>{children}</>
}

import { requireUserSession } from '@/lib/auth/require-user-session'

export default async function RecordingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUserSession('/recordings')
  return <>{children}</>
}

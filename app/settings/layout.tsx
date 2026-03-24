import { requireCompletedUserSession } from '@/lib/auth/require-user-session'

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireCompletedUserSession('/settings/latency')
  return <>{children}</>
}

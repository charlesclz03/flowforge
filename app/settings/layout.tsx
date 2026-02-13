import { requireUserSession } from '@/lib/auth/require-user-session'

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUserSession('/settings/latency')
  return <>{children}</>
}

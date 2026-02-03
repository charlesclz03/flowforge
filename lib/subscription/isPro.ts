export function isProUser(user?: {
  subscriptionStatus?: string | null
  role?: string | null
}): boolean {
  return (
    user?.role === 'SUPERADMIN' ||
    user?.subscriptionStatus === 'active' ||
    user?.subscriptionStatus === 'trialing'
  )
}


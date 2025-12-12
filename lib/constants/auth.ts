export const SUPER_ADMIN_EMAILS = ['triplyricist@gmail.com']

export const isAdmin = (email?: string | null) => {
  if (!email) return false
  return SUPER_ADMIN_EMAILS.includes(email)
}

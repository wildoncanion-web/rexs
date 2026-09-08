export const ADMIN_EMAILS = [
  "support@investmentholdingsllc.org",
  "somamanisha383@gmail.com",
  "nonstopfugo@gmail.com",
]

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

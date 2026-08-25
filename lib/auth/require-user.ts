import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'

// Defense-in-depth alongside middleware.ts: every protected server
// component / server action calls this to get a verified user id rather
// than trusting the route was reached only through the middleware chain.
export async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }
  return session.user as { id: string; name?: string | null; email?: string | null; image?: string | null }
}

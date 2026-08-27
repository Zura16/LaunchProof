import { cache } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export interface AuthedUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

/**
 * Resolve the signed-in user, verifying they still exist.
 *
 * Sessions are JWTs: self-contained, signed, and valid until they expire —
 * they are not checked against the database on their own. So a token can
 * outlive the row it refers to (the account was deleted in another tab, or
 * the database was reset in development). Trusting `token.sub` blindly meant
 * the next write failed on a foreign-key constraint with a raw Prisma error
 * instead of simply signing the person out.
 *
 * Verifying here costs one indexed lookup per request, deduplicated across a
 * render pass by `cache()`, and is defense-in-depth alongside middleware.
 */
export const requireUser = cache(async (): Promise<AuthedUser> => {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true },
  })

  if (!user) {
    // The token is valid but its user is gone. Back to sign-in: the login
    // page performs the same existence check, so it renders the form rather
    // than bouncing on the stale session, and signing in issues a fresh one.
    redirect('/login')
  }

  return user
})

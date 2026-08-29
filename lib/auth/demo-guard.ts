import { prisma } from '@/lib/db/prisma'
import { DEMO_ACCOUNT_EMAIL } from '@/lib/auth/auth'

export class DemoAccountError extends Error {
  constructor(message = 'The demo account is shared, so this action is disabled. Sign in with your own account to use it.') {
    super(message)
  }
}

/**
 * Block destructive actions on the shared demo account.
 *
 * Every visitor who clicks "Explore the demo account" signs into the *same*
 * seeded user. Exploration is the point, so ordinary writes stay allowed —
 * saving a job, creating a project plan, ticking off tasks. But deletions are
 * not recoverable and would degrade the demo for everyone who comes after,
 * and account deletion would destroy it outright.
 */
export async function assertNotDemoAccount(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
  if (user?.email === DEMO_ACCOUNT_EMAIL) {
    throw new DemoAccountError()
  }
}

export async function isDemoAccount(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
  return user?.email === DEMO_ACCOUNT_EMAIL
}

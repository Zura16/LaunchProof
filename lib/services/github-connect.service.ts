import { Octokit } from 'octokit'
import { prisma } from '@/lib/db/prisma'

// Onboarding only links GitHub when the user actually signed in with the
// GitHub OAuth provider — the Account row (and its access_token) already
// exists at that point, created by the Prisma adapter. We deliberately do
// NOT attempt to link a second, different-provider OAuth account to an
// existing session here (Auth.js's `allowDangerousEmailAccountLinking` is
// exactly as risky as it sounds); that's real scope for the full GitHub
// integration phase, not onboarding.
export async function getLinkedGitHubAccount(userId: string) {
  const existing = await prisma.gitHubAccount.findUnique({ where: { userId } })
  if (existing) return existing

  const account = await prisma.account.findFirst({ where: { userId, provider: 'github' } })
  if (!account?.access_token) return null

  // This is a live call to GitHub during a page render. It can fail for
  // reasons that have nothing to do with the student — a revoked token, an
  // expired one, rate limiting, or GitHub being down. None of those should
  // take down onboarding, so a failure degrades to "not connected yet"
  // instead of throwing out of the render.
  try {
    const octokit = new Octokit({ auth: account.access_token })
    const { data } = await octokit.rest.users.getAuthenticated()

    return await prisma.gitHubAccount.create({
      data: {
        userId,
        username: data.login,
        avatarUrl: data.avatar_url,
        profileUrl: data.html_url,
      },
    })
  } catch (e) {
    console.error('[github] could not link account during onboarding:', e instanceof Error ? e.message : e)
    return null
  }
}

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

  const octokit = new Octokit({ auth: account.access_token })
  const { data } = await octokit.rest.users.getAuthenticated()

  return prisma.gitHubAccount.create({
    data: {
      userId,
      username: data.login,
      avatarUrl: data.avatar_url,
      profileUrl: data.html_url,
    },
  })
}

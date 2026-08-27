import Link from 'next/link'
import { Github, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProfileForm } from '@/components/settings/profile-form'
import { DeleteAccountButton } from '@/components/settings/delete-account-button'
import { GitHubActions } from '@/components/settings/github-section'
import type { RepoAnalysis } from '@/lib/github/types'

function Signal({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      {ok ? (
        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
      ) : (
        <XCircle className="h-3 w-3 text-slate-300" />
      )}
      {label}
    </span>
  )
}

export default async function SettingsPage({ searchParams }: { searchParams: { githubError?: string } }) {
  const user = await requireUser()

  const [profile, githubAccount] = await Promise.all([
    prisma.studentProfile.findUniqueOrThrow({ where: { userId: user.id } }),
    prisma.gitHubAccount.findUnique({
      where: { userId: user.id },
      include: { repositories: { orderBy: { stars: 'desc' } } },
    }),
  ])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initial={{
              fullName: profile.fullName,
              university: profile.university,
              degree: profile.degree,
              major: profile.major,
              graduationDate: profile.graduationDate.toISOString().slice(0, 10),
              academicYear: profile.academicYear,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle>GitHub</CardTitle>
            <CardDescription>
              {githubAccount
                ? 'Repositories are inspected for dependencies, tests, containers, and CI to build verifiable evidence.'
                : 'Connect GitHub so LaunchProof can verify skills against real code instead of taking your word for it.'}
            </CardDescription>
          </div>
          {githubAccount && <GitHubActions />}
        </CardHeader>
        <CardContent className="space-y-4">
          {searchParams.githubError && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50/50 px-3 py-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="text-xs text-red-800">{searchParams.githubError}</p>
            </div>
          )}

          {!githubAccount ? (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-slate-500">
                <Github className="h-4 w-4" />
                Not connected
              </span>
              <Link href="/onboarding?step=4">
                <Button size="sm" variant="outline">
                  <Github className="h-4 w-4" />
                  Connect GitHub
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Github className="h-4 w-4 text-slate-500" />
                Connected as <span className="font-medium">@{githubAccount.username}</span>
              </div>

              {githubAccount.repositories.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No repositories analyzed yet. Run a sync to inspect your public repositories.
                </p>
              ) : (
                <div className="space-y-2">
                  {githubAccount.repositories.map((repo) => {
                    const analysis = repo.analysisResult as unknown as RepoAnalysis | null
                    const detected = analysis?.detected ?? []
                    const signals = analysis?.signals
                    return (
                      <div key={repo.id} className="rounded-md border border-slate-100 px-3 py-2.5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <a
                            href={repo.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-slate-900 hover:underline"
                          >
                            {repo.name}
                          </a>
                          <span className="text-xs text-slate-400">
                            {repo.primaryLanguage ?? 'Unknown'}
                            {repo.stars > 0 ? ` · ★ ${repo.stars}` : ''}
                          </span>
                        </div>

                        {signals && (
                          <div className="mt-1.5 flex flex-wrap gap-3">
                            <Signal ok={signals.hasTests} label="tests" />
                            <Signal ok={signals.hasCI} label="CI" />
                            <Signal ok={signals.hasDocker} label="Docker" />
                            <Signal ok={signals.hasDeployConfig} label="deploy config" />
                          </div>
                        )}

                        {detected.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {detected.slice(0, 10).map((d) => (
                              <Badge
                                key={d.skillName}
                                variant={d.strength === 'STRONG' ? 'success' : d.strength === 'MODERATE' ? 'info' : 'outline'}
                              >
                                {d.skillName}
                              </Badge>
                            ))}
                            {detected.length > 10 && (
                              <span className="text-xs text-slate-400">+{detected.length - 10} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
          <CardDescription>Permanently delete your account and all associated data.</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </div>
  )
}

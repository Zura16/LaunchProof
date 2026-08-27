import Link from 'next/link'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { EmptyState } from '@/components/shared/empty-state'
import { createProjectPlanAction } from '@/app/(dashboard)/recommendations/actions'
import { computeSkillGaps, priorityLabel } from '@/lib/services/gap-analysis.service'

const IMPACT_VARIANT = { HIGH: 'destructive', MEDIUM: 'warning', LOW: 'outline' } as const

export default async function DashboardPage() {
  const user = await requireUser()

  const [
    savedJobCount,
    strongSkillCount,
    studentSkillCount,
    skillGaps,
    activeApplicationCount,
    recommendations,
    recentSavedJobs,
    resumeCount,
    githubAccount,
  ] = await Promise.all([
    prisma.savedJob.count({ where: { userId: user.id } }),
    prisma.studentSkill.count({ where: { userId: user.id, highestStrength: 'STRONG' } }),
    prisma.studentSkill.count({ where: { userId: user.id } }),
    computeSkillGaps(user.id),
    prisma.application.count({ where: { userId: user.id, status: { notIn: ['SAVED', 'REJECTED', 'WITHDRAWN'] } } }),
    prisma.recommendation.findMany({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { projectPlan: true },
      orderBy: { priorityScore: 'desc' },
      take: 3,
    }),
    prisma.savedJob.findMany({
      where: { userId: user.id },
      include: { jobPosting: true, application: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.resume.count({ where: { userId: user.id } }),
    prisma.gitHubAccount.findUnique({ where: { userId: user.id } }),
  ])

  const highPriorityGapCount = skillGaps.filter((g) => priorityLabel(g.priorityScore) === 'High').length

  // Same aggregation as Market Insights, ordered demand-first.
  const marketRows =
    savedJobCount >= 3
      ? [...skillGaps].sort((a, b) => b.marketCount - a.marketCount || b.marketPercent - a.marketPercent).slice(0, 5)
      : []

  const checklist = [
    { label: 'Upload résumé', done: resumeCount > 0, href: '/resume' },
    { label: 'Connect GitHub', done: !!githubAccount, href: '/onboarding?step=4' },
    { label: 'Save 5 target jobs', done: savedJobCount >= 5, href: '/jobs/new' },
  ]
  const setupIncomplete = checklist.some((c) => !c.done)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: 'Target jobs saved', value: savedJobCount },
          { label: 'Skills analyzed', value: studentSkillCount },
          { label: 'Strong evidence', value: strongSkillCount },
          { label: 'High-priority gaps', value: highPriorityGapCount },
          { label: 'Active applications', value: activeApplicationCount },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="py-4">
              <p className="text-2xl font-semibold text-slate-900">{m.value}</p>
              <p className="text-xs text-slate-500">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Highest-Impact Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <EmptyState
              title="No recommendations yet"
              description="Save target jobs and connect your evidence to surface the highest-impact gaps to close first."
            />
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="rounded-md border border-slate-100 p-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{rec.title}</p>
                    <Badge variant={IMPACT_VARIANT[rec.impact]}>{rec.impact} impact</Badge>
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-slate-500">{rec.reasoning}</p>
                  {rec.projectPlan ? (
                    <Link href={`/projects/${rec.projectPlan.id}`}>
                      <Button size="sm" variant="outline">
                        View Project Plan
                      </Button>
                    </Link>
                  ) : rec.type === 'APPLY_NOW' ? (
                    <Link href="/jobs">
                      <Button size="sm" variant="outline">
                        View Target Jobs
                      </Button>
                    </Link>
                  ) : (
                    <form action={createProjectPlanAction.bind(null, rec.id)}>
                      <Button type="submit" size="sm">
                        Create Improvement Plan
                      </Button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Target Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSavedJobs.length === 0 ? (
              <EmptyState
                title="No target jobs yet"
                description="Save the jobs you're actually targeting to start building your evidence picture."
                action={
                  <Link href="/jobs/new">
                    <Button size="sm">Add Target Job</Button>
                  </Link>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Saved</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSavedJobs.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-slate-900">
                        <Link href={`/jobs/${s.id}`} className="hover:underline">
                          {s.jobPosting.company}
                        </Link>
                      </TableCell>
                      <TableCell>{s.jobPosting.title}</TableCell>
                      <TableCell>{s.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={s.application ? 'info' : 'outline'}>
                          {s.application?.status.replace('_', ' ') ?? 'Saved'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Market Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {marketRows.length === 0 ? (
              <EmptyState title="Not enough data yet" description="Save at least 3 target jobs to see recurring skill demand." />
            ) : (
              marketRows.map((r) => (
                <Link key={r.skillId} href={`/evidence/${r.skillId}`} className="block">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{r.skillName}</span>
                    <span className="text-slate-400">
                      {r.marketCount} / {r.totalJobs}
                    </span>
                  </div>
                  <Progress value={r.marketCount} max={r.totalJobs} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {setupIncomplete && (
        <Card>
          <CardHeader>
            <CardTitle>Setup checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {checklist.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  {c.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300" />
                  )}
                  <span className={c.done ? 'text-slate-400 line-through' : 'text-slate-700'}>{c.label}</span>
                </span>
                {!c.done && <ArrowRight className="h-3.5 w-3.5 text-slate-400" />}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

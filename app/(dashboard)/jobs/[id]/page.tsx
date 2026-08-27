import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, CheckCircle2, Trash2, AlertTriangle, ChevronRight } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { getJobFit } from '@/lib/services/job-fit.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { FitBadge } from '@/components/shared/evidence-badge'
import { Tooltip } from '@/components/ui/tooltip'
import { deleteSavedJobAction, markAppliedAction } from '@/app/(dashboard)/jobs/actions'
import { AnalyzeJobButton } from '@/components/jobs/analyze-job-button'
import type { RequirementType } from '@prisma/client'

const GROUPS: { type: RequirementType; label: string }[] = [
  { type: 'REQUIRED', label: 'Required' },
  { type: 'PREFERRED', label: 'Preferred' },
  { type: 'RESPONSIBILITY', label: 'Responsibilities' },
  { type: 'ELIGIBILITY', label: 'Eligibility' },
]

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { analysisError?: string }
}) {
  const user = await requireUser()

  const saved = await prisma.savedJob.findUnique({
    where: { id: params.id },
    include: {
      jobPosting: { include: { requirements: { include: { skill: true } } } },
      application: true,
    },
  })

  if (!saved || saved.userId !== user.id) notFound()

  const { jobPosting } = saved
  const fit = await getJobFit(user.id, jobPosting.id)

  return (
    <div className="space-y-6">
      {searchParams.analysisError && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="flex items-start gap-2 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-xs text-red-800">{searchParams.analysisError}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">{jobPosting.title}</h2>
            <p className="text-sm text-slate-600">
              {jobPosting.company}
              {jobPosting.location ? ` · ${jobPosting.location}` : ''}
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
              <span>Saved {saved.createdAt.toLocaleDateString()}</span>
              {jobPosting.url && (
                <a href={jobPosting.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-slate-500 hover:text-slate-900">
                  Original posting <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <form action={markAppliedAction.bind(null, saved.id)}>
              <Button type="submit" size="sm" variant={saved.application?.status === 'APPLIED' ? 'secondary' : 'outline'}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                {saved.application ? 'Applied' : 'Mark Applied'}
              </Button>
            </form>
            <form action={deleteSavedJobAction.bind(null, saved.id)}>
              <Button type="submit" size="sm" variant="ghost">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Fit</CardTitle>
          <CardDescription>
            Every classification below is explainable — expand a skill to see exactly why it was rated that way.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fit.rows.length === 0 ? (
            <EmptyState
              title="No requirements to compare yet"
              description="Run analysis on this job first — LaunchProof compares its extracted requirements against your evidence."
              action={<AnalyzeJobButton savedJobId={saved.id} />}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {fit.rows.map((row) => (
                <details key={row.skillId} className="group py-2 first:pt-0 last:pb-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-1 py-1.5 hover:bg-slate-50">
                    <span className="flex items-center gap-2">
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
                      <span className="text-sm font-medium text-slate-900">{row.skillName}</span>
                      {row.requirementType === 'REQUIRED' && (
                        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Required</span>
                      )}
                    </span>
                    <FitBadge classification={row.classification} />
                  </summary>
                  <p className="ml-6 mt-1 pr-2 text-xs leading-relaxed text-slate-500">{row.why}</p>
                </details>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {fit.recommendation && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <p className="text-sm font-semibold text-slate-900">{fit.recommendation.headline}</p>
            <p className="text-sm leading-relaxed text-slate-600">{fit.recommendation.reasoning}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Requirements</CardTitle>
          {jobPosting.requirements.length > 0 && (
            <span className="text-xs text-slate-400">{jobPosting.requirements.length} skills extracted</span>
          )}
        </CardHeader>
        <CardContent>
          {jobPosting.requirements.length === 0 ? (
            <EmptyState
              title="Requirement extraction pending"
              description="Run analysis to extract required, preferred, responsibility, and eligibility skills from this job description."
              action={<AnalyzeJobButton savedJobId={saved.id} />}
            />
          ) : (
            <div className="space-y-4">
              {GROUPS.map((g) => {
                const items = jobPosting.requirements.filter((r) => r.type === g.type)
                if (items.length === 0) return null
                return (
                  <div key={g.type}>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">{g.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((r) => (
                        <Tooltip key={r.id} content={`"${r.rawMention}" · ${r.importance.toLowerCase()} importance`}>
                          <Badge variant="outline">{r.skill.name}</Badge>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{jobPosting.description}</p>
        </CardContent>
      </Card>

      <div>
        <Link href="/jobs" className="text-xs font-medium text-slate-500 hover:text-slate-900">
          ← Back to Target Jobs
        </Link>
      </div>
    </div>
  )
}

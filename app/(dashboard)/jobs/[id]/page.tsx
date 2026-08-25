import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, CheckCircle2, Trash2 } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { deleteSavedJobAction, markAppliedAction } from '@/app/(dashboard)/jobs/actions'
import type { RequirementType } from '@prisma/client'

const GROUPS: { type: RequirementType; label: string }[] = [
  { type: 'REQUIRED', label: 'Required' },
  { type: 'PREFERRED', label: 'Preferred' },
  { type: 'RESPONSIBILITY', label: 'Responsibilities' },
  { type: 'ELIGIBILITY', label: 'Eligibility' },
]

export default async function JobDetailPage({ params }: { params: { id: string } }) {
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

  return (
    <div className="space-y-6">
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
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Evidence comparison not yet available"
            description="Your Fit compares this job's requirements against your evidence graph — it becomes available once skill gap analysis is built out."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          {jobPosting.requirements.length === 0 ? (
            <EmptyState
              title="Requirement extraction pending"
              description="Structured skill extraction from this job description hasn't run yet."
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
                        <Badge key={r.id} variant="outline">
                          {r.skill.name}
                        </Badge>
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

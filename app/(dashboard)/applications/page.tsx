import Link from 'next/link'
import { Send, ChevronRight } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { StatusSelect } from '@/components/applications/status-select'
import { TrackJobForm } from '@/components/applications/track-job-form'
import { TERMINAL_STATUSES } from '@/schemas/application'
import { cn, formatDateOnly } from '@/lib/utils'
import type { ApplicationStatus } from '@prisma/client'

const FILTERS = [
  { key: 'active', label: 'Active' },
  { key: 'all', label: 'All' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'closed', label: 'Closed' },
] as const

const INTERVIEWING: ApplicationStatus[] = [
  'ONLINE_ASSESSMENT',
  'RECRUITER_SCREEN',
  'TECHNICAL_INTERVIEW',
  'FINAL_INTERVIEW',
]

export default async function ApplicationsPage({ searchParams }: { searchParams: { filter?: string } }) {
  const user = await requireUser()

  const [applications, untrackedJobs] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id },
      include: { savedJob: { include: { jobPosting: true } }, resume: { select: { fileName: true } } },
      orderBy: [{ nextInterviewDate: 'asc' }, { updatedAt: 'desc' }],
    }),
    prisma.savedJob.findMany({
      where: { userId: user.id, application: null },
      include: { jobPosting: { select: { company: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const filter = (searchParams.filter ?? 'active') as (typeof FILTERS)[number]['key']
  const terminal = TERMINAL_STATUSES as readonly string[]

  const visible = applications.filter((a) => {
    if (filter === 'all') return true
    if (filter === 'closed') return terminal.includes(a.status)
    if (filter === 'interviewing') return INTERVIEWING.includes(a.status)
    return !terminal.includes(a.status)
  })

  const counts = {
    active: applications.filter((a) => !terminal.includes(a.status)).length,
    interviewing: applications.filter((a) => INTERVIEWING.includes(a.status)).length,
    offers: applications.filter((a) => a.status === 'OFFER').length,
    closed: applications.filter((a) => terminal.includes(a.status)).length,
  }

  if (applications.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={<Send className="h-5 w-5" />}
          title="No applications tracked yet"
          description="Track a saved job to follow it through your pipeline, or mark a target job as applied from its detail page."
          action={
            untrackedJobs.length > 0 ? (
              <TrackJobForm
                untracked={untrackedJobs.map((j) => ({
                  savedJobId: j.id,
                  label: `${j.jobPosting.company} — ${j.jobPosting.title}`,
                }))}
              />
            ) : (
              <Link href="/jobs">
                <Button size="sm">Go to Target Jobs</Button>
              </Link>
            )
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Active', value: counts.active },
          { label: 'Interviewing', value: counts.interviewing },
          { label: 'Offers', value: counts.offers },
          { label: 'Closed', value: counts.closed },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="py-3">
              <p className="text-xl font-semibold text-slate-900">{m.value}</p>
              <p className="text-xs text-slate-500">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === 'active' ? '/applications' : `/applications?filter=${f.key}`}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium',
                filter === f.key
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <TrackJobForm
          untracked={untrackedJobs.map((j) => ({
            savedJobId: j.id,
            label: `${j.jobPosting.company} — ${j.jobPosting.title}`,
          }))}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="Nothing in this view"
          description="No applications match this filter right now."
        />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Résumé sent</TableHead>
                <TableHead>Referral</TableHead>
                <TableHead>Next interview</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium text-slate-900">
                    <Link href={`/applications/${app.id}`} className="hover:underline">
                      {app.savedJob.jobPosting.company}
                    </Link>
                    <span className="ml-1.5 font-normal text-slate-400">{app.savedJob.jobPosting.title}</span>
                  </TableCell>
                  <TableCell>{formatDateOnly(app.appliedDate)}</TableCell>
                  <TableCell>
                    <StatusSelect applicationId={app.id} status={app.status} />
                  </TableCell>
                  <TableCell className="max-w-40 truncate">{app.resume?.fileName ?? '—'}</TableCell>
                  <TableCell>{app.referralContact ?? '—'}</TableCell>
                  <TableCell>{formatDateOnly(app.nextInterviewDate)}</TableCell>
                  <TableCell>
                    <Link href={`/applications/${app.id}`} aria-label="Open application details">
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

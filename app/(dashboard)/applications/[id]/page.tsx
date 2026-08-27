import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, Trash2 } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApplicationForm } from '@/components/applications/application-form'
import { deleteApplicationAction } from '@/app/(dashboard)/applications/actions'
import { STATUS_LABEL, TERMINAL_STATUSES } from '@/schemas/application'

function toDateInput(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : ''
}

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser()

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: { savedJob: { include: { jobPosting: true } } },
  })

  if (!application || application.userId !== user.id) notFound()

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    select: { id: true, fileName: true },
    orderBy: { createdAt: 'desc' },
  })

  const { jobPosting } = application.savedJob
  const isClosed = (TERMINAL_STATUSES as readonly string[]).includes(application.status)

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
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              <Link href={`/jobs/${application.savedJobId}`} className="text-slate-500 hover:text-slate-900">
                View job analysis
              </Link>
              {jobPosting.url && (
                <a
                  href={jobPosting.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
                >
                  Original posting <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {application.closedAt && <span>Closed {application.closedAt.toLocaleDateString()}</span>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={application.status === 'OFFER' ? 'success' : isClosed ? 'outline' : 'info'}>
              {STATUS_LABEL[application.status]}
            </Badge>
            <form action={deleteApplicationAction.bind(null, application.id)}>
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
          <CardTitle>Application details</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicationForm
            applicationId={application.id}
            resumes={resumes}
            initial={{
              status: application.status,
              appliedDate: toDateInput(application.appliedDate),
              nextInterviewDate: toDateInput(application.nextInterviewDate),
              resumeId: application.resumeId ?? '',
              referralContact: application.referralContact ?? '',
              recruiterContact: application.recruiterContact ?? '',
              notes: application.notes ?? '',
              outcomeNote: application.outcomeNote ?? '',
              rejectionStage: application.rejectionStage ?? '',
            }}
          />
        </CardContent>
      </Card>

      <div>
        <Link href="/applications" className="text-xs font-medium text-slate-500 hover:text-slate-900">
          ← Back to Applications
        </Link>
      </div>
    </div>
  )
}

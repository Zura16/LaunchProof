import Link from 'next/link'
import { Send } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { StatusSelect } from '@/components/applications/status-select'

export default async function ApplicationsPage() {
  const user = await requireUser()

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: { savedJob: { include: { jobPosting: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={<Send className="h-5 w-5" />}
        title="No applications tracked yet"
        description="Mark a target job as applied to start tracking it through your pipeline."
        action={
          <Link href="/jobs">
            <Button size="sm">Go to Target Jobs</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Referral</TableHead>
            <TableHead>Next interview</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium text-slate-900">
                <Link href={`/jobs/${app.savedJobId}`} className="hover:underline">
                  {app.savedJob.jobPosting.company}
                </Link>
                <span className="ml-1.5 text-slate-400">{app.savedJob.jobPosting.title}</span>
              </TableCell>
              <TableCell>{app.appliedDate ? app.appliedDate.toLocaleDateString() : '—'}</TableCell>
              <TableCell>
                <StatusSelect applicationId={app.id} status={app.status} />
              </TableCell>
              <TableCell>{app.referralContact ?? '—'}</TableCell>
              <TableCell>{app.nextInterviewDate ? app.nextInterviewDate.toLocaleDateString() : '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

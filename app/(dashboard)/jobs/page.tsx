import Link from 'next/link'
import { Plus, Briefcase } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { EmptyState } from '@/components/shared/empty-state'

export default async function JobsPage() {
  const user = await requireUser()

  const savedJobs = await prisma.savedJob.findMany({
    where: { userId: user.id },
    include: {
      jobPosting: { include: { requirements: true } },
      application: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{savedJobs.length} saved</p>
        <Link href="/jobs/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Job
          </Button>
        </Link>
      </div>

      {savedJobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-5 w-5" />}
          title="No target jobs saved yet"
          description="Paste in a posting you're actually targeting. LaunchProof will extract its required and preferred skills so it can compare them against your evidence."
          action={
            <Link href="/jobs/new">
              <Button size="sm">Add Target Job</Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date saved</TableHead>
                <TableHead>Requirements</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedJobs.map((saved) => (
                <TableRow key={saved.id}>
                  <TableCell className="font-medium text-slate-900">
                    <Link href={`/jobs/${saved.id}`} className="hover:underline">
                      {saved.jobPosting.company}
                    </Link>
                  </TableCell>
                  <TableCell>{saved.jobPosting.title}</TableCell>
                  <TableCell>{saved.jobPosting.location ?? '—'}</TableCell>
                  <TableCell>{saved.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    {saved.jobPosting.requirements.length > 0 ? (
                      `${saved.jobPosting.requirements.length} extracted`
                    ) : (
                      <Link href={`/jobs/${saved.id}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                          Analyze now
                        </Badge>
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={saved.application ? 'info' : 'outline'}>
                      {saved.application?.status.replace('_', ' ') ?? 'Saved'}
                    </Badge>
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

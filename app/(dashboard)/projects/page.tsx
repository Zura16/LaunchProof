import Link from 'next/link'
import { FolderGit2 } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/shared/empty-state'

export default async function ProjectsPage() {
  const user = await requireUser()

  const plans = await prisma.projectPlan.findMany({
    where: { userId: user.id },
    include: { milestones: { include: { tasks: true } } },
    orderBy: { createdAt: 'desc' },
  })

  if (plans.length === 0) {
    return (
      <EmptyState
        icon={<FolderGit2 className="h-5 w-5" />}
        title="No project plans yet"
        description="Turn a recommendation into a concrete, milestone-based project plan from the Recommendations page."
        action={
          <Link href="/recommendations" className="text-sm font-medium text-slate-900 underline">
            View Recommendations
          </Link>
        }
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {plans.map((plan) => {
        const tasks = plan.milestones.flatMap((m) => m.tasks)
        const done = tasks.filter((t) => t.isCompleted).length
        return (
          <Link key={plan.id} href={`/projects/${plan.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{plan.title}</CardTitle>
                <Badge variant={plan.status === 'COMPLETED' ? 'success' : 'outline'}>{plan.status.replace('_', ' ')}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-xs text-slate-500">{plan.objective}</p>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {done}/{tasks.length} tasks
                    </span>
                    <span>{plan.milestones.length} milestones</span>
                  </div>
                  <Progress value={done} max={tasks.length || 1} />
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

import { notFound } from 'next/navigation'
import { CheckCircle2, Circle } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toggleMilestoneAction } from '@/app/(dashboard)/projects/actions'
import { cn } from '@/lib/utils'

export default async function ProjectPlanDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser()

  const plan = await prisma.projectPlan.findUnique({
    where: { id: params.id },
    include: { milestones: { orderBy: { order: 'asc' } } },
  })

  if (!plan || plan.userId !== user.id) notFound()

  const done = plan.milestones.filter((m) => m.isCompleted).length

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{plan.title}</h2>
              {plan.targetRepoName && <p className="text-xs text-slate-500">Target repository: {plan.targetRepoName}</p>}
            </div>
            <Badge variant={plan.status === 'COMPLETED' ? 'success' : 'outline'}>{plan.status.replace('_', ' ')}</Badge>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>
                {done}/{plan.milestones.length} milestones complete
              </span>
            </div>
            <Progress value={done} max={plan.milestones.length || 1} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Objective</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-slate-600">{plan.objective}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Why it matters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-slate-600">{plan.whyItMatters}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.milestones.map((m) => (
            <div key={m.id} className="rounded-md border border-slate-100 p-3">
              <form action={toggleMilestoneAction.bind(null, m.id, plan.id)}>
                <button type="submit" className="flex w-full items-start gap-2.5 text-left">
                  {m.isCompleted ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                  )}
                  <div>
                    <p className={cn('text-sm font-medium text-slate-900', m.isCompleted && 'text-slate-400 line-through')}>
                      {m.order}. {m.title}
                    </p>
                    <p className="text-xs text-slate-500">{m.description}</p>
                  </div>
                </button>
              </form>
              <ul className="ml-6 mt-2 space-y-1 pl-1">
                {m.tasks.map((t, i) => (
                  <li key={i} className="text-xs text-slate-500">
                    · {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Definition of Done</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {plan.definitionOfDone.map((d, i) => (
                <li key={i} className="text-xs text-slate-600">
                  · {d}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expected Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {plan.expectedEvidence.map((e, i) => (
                <li key={i} className="text-xs text-slate-600">
                  · {e}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

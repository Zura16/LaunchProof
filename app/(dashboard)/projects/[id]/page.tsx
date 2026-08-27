import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Circle } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toggleTaskAction } from '@/app/(dashboard)/projects/actions'
import { cn } from '@/lib/utils'

export default async function ProjectPlanDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser()

  const plan = await prisma.projectPlan.findUnique({
    where: { id: params.id },
    include: {
      milestones: { orderBy: { order: 'asc' }, include: { tasks: { orderBy: { order: 'asc' } } } },
      recommendation: { select: { id: true } },
    },
  })

  if (!plan || plan.userId !== user.id) notFound()

  const allTasks = plan.milestones.flatMap((m) => m.tasks)
  const doneTasks = allTasks.filter((t) => t.isCompleted).length

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{plan.title}</h2>
              {plan.targetRepoName && (
                <p className="text-xs text-slate-500">Target repository: {plan.targetRepoName}</p>
              )}
            </div>
            <Badge variant={plan.status === 'COMPLETED' ? 'success' : plan.status === 'IN_PROGRESS' ? 'info' : 'outline'}>
              {plan.status.replace('_', ' ')}
            </Badge>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>
                {doneTasks} of {allTasks.length} tasks complete
              </span>
              <span>{allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0}%</span>
            </div>
            <Progress value={doneTasks} max={allTasks.length || 1} />
          </div>
          {plan.skillsTargeted.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
              {plan.skillsTargeted.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          )}
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
        <CardContent className="space-y-4">
          {plan.milestones.map((m) => {
            const milestoneDone = m.tasks.length > 0 && m.tasks.every((t) => t.isCompleted)
            return (
              <div key={m.id} className="rounded-md border border-slate-100 p-3">
                <div className="mb-2 flex items-start gap-2">
                  {milestoneDone ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                  )}
                  <div>
                    <p className={cn('text-sm font-medium text-slate-900', milestoneDone && 'text-slate-400')}>
                      {m.order}. {m.title}
                    </p>
                    {m.description && <p className="text-xs text-slate-500">{m.description}</p>}
                  </div>
                </div>

                <ul className="ml-6 space-y-1">
                  {m.tasks.map((t) => (
                    <li key={t.id}>
                      <form action={toggleTaskAction.bind(null, t.id, plan.id)}>
                        <button
                          type="submit"
                          className="flex w-full items-start gap-2 rounded px-1 py-1 text-left hover:bg-slate-50"
                        >
                          <span
                            className={cn(
                              'mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border',
                              t.isCompleted ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                            )}
                            aria-hidden="true"
                          >
                            {t.isCompleted && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </span>
                          <span
                            className={cn(
                              'text-xs leading-relaxed',
                              t.isCompleted ? 'text-slate-400 line-through' : 'text-slate-600'
                            )}
                          >
                            {t.title}
                          </span>
                          <span className="sr-only">
                            {t.isCompleted ? 'Mark task incomplete' : 'Mark task complete'}
                          </span>
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
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

      <div>
        <Link href="/recommendations" className="text-xs font-medium text-slate-500 hover:text-slate-900">
          ← Back to Recommendations
        </Link>
      </div>
    </div>
  )
}

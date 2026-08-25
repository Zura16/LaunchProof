import Link from 'next/link'
import { Lightbulb } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { createProjectPlanAction } from '@/app/(dashboard)/recommendations/actions'
import type { RecommendationImpact } from '@prisma/client'

const IMPACT_VARIANT: Record<RecommendationImpact, 'destructive' | 'warning' | 'outline'> = {
  HIGH: 'destructive',
  MEDIUM: 'warning',
  LOW: 'outline',
}

export default async function RecommendationsPage() {
  const user = await requireUser()

  const recommendations = await prisma.recommendation.findMany({
    where: { userId: user.id, status: 'ACTIVE' },
    include: { projectPlan: true },
    orderBy: { priorityScore: 'desc' },
  })

  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon={<Lightbulb className="h-5 w-5" />}
        title="No recommendations yet"
        description="Save target jobs and connect your evidence — LaunchProof will surface the highest-impact gaps to close first."
        action={
          <Link href="/jobs/new">
            <Button size="sm">Add Target Job</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <Card key={rec.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>{rec.title}</CardTitle>
            <Badge variant={IMPACT_VARIANT[rec.impact]}>{rec.impact} impact</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-slate-600">{rec.reasoning}</p>
            {rec.skillsAddressed.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Addresses</p>
                <div className="flex flex-wrap gap-1.5">
                  {rec.skillsAddressed.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end pt-1">
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
                    Create Project Plan
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

import Link from 'next/link'
import { Lightbulb } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import {
  RegenerateButton,
  CreatePlanButton,
  DismissButton,
} from '@/components/recommendations/recommendation-controls'
import type { RecommendationImpact } from '@prisma/client'

const IMPACT_VARIANT: Record<RecommendationImpact, 'destructive' | 'warning' | 'outline'> = {
  HIGH: 'destructive',
  MEDIUM: 'warning',
  LOW: 'outline',
}

const TYPE_LABEL: Record<string, string> = {
  IMPROVE_EXISTING_PROJECT: 'Improve existing project',
  BUILD_NEW_PROJECT: 'Build new project',
  ADD_TESTING: 'Add testing',
  DEPLOY_PROJECT: 'Deploy project',
  IMPROVE_DOCUMENTATION: 'Improve documentation',
  ADD_DATABASE: 'Add database',
  ADD_CICD: 'Add CI/CD',
  STRENGTHEN_RESUME: 'Strengthen résumé evidence',
  APPLY_NOW: 'Apply now',
}

export default async function RecommendationsPage() {
  const user = await requireUser()

  const [recommendations, savedJobCount] = await Promise.all([
    prisma.recommendation.findMany({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { projectPlan: { select: { id: true } } },
      orderBy: { priorityScore: 'desc' },
    }),
    prisma.savedJob.count({ where: { userId: user.id } }),
  ])

  if (recommendations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <RegenerateButton />
        </div>
        <EmptyState
          icon={<Lightbulb className="h-5 w-5" />}
          title={savedJobCount === 0 ? 'No recommendations yet' : 'Nothing to recommend right now'}
          description={
            savedJobCount === 0
              ? 'Save target jobs and connect your evidence — LaunchProof will surface the highest-impact gaps to close first.'
              : 'Either your saved jobs have not been analyzed yet, or you already have strong evidence for what they ask for. Try regenerating after analyzing more jobs.'
          }
          action={
            savedJobCount === 0 ? (
              <Link href="/discover">
                <Button size="sm">Browse Discover</Button>
              </Link>
            ) : undefined
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Ranked by how often each gap appears across your target jobs and how much work it takes to close.
        </p>
        <RegenerateButton />
      </div>

      {recommendations.map((rec) => (
        <Card key={rec.id}>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>{rec.title}</CardTitle>
              <p className="text-xs text-slate-400">{TYPE_LABEL[rec.type] ?? rec.type}</p>
            </div>
            <Badge variant={IMPACT_VARIANT[rec.impact]}>{rec.impact} impact</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-slate-600">{rec.reasoning}</p>

            {rec.skillsAddressed.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Creates evidence for
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {rec.skillsAddressed.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              {rec.type !== 'APPLY_NOW' && <DismissButton recommendationId={rec.id} />}
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
                <CreatePlanButton recommendationId={rec.id} />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

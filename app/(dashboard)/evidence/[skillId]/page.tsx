import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { computeSkillGaps } from '@/lib/services/gap-analysis.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EvidenceBadge } from '@/components/shared/evidence-badge'
import { EmptyState } from '@/components/shared/empty-state'
import type { EvidenceSourceType } from '@prisma/client'

const SOURCE_LABEL: Record<EvidenceSourceType, string> = {
  GITHUB_REPOSITORY: 'GitHub repository',
  RESUME_PROJECT: 'Résumé project',
  WORK_EXPERIENCE: 'Work experience',
  COURSEWORK: 'Coursework',
  MANUAL: 'Manual claim',
  PORTFOLIO: 'Portfolio',
  DEPLOYED_APP: 'Deployed application',
}

export default async function SkillEvidenceDetailPage({ params }: { params: { skillId: string } }) {
  const user = await requireUser()

  const skill = await prisma.skill.findUnique({ where: { id: params.skillId } })
  if (!skill) notFound()

  const [studentSkill, evidences, gaps] = await Promise.all([
    prisma.studentSkill.findUnique({
      where: { userId_skillId: { userId: user.id, skillId: skill.id } },
    }),
    prisma.evidence.findMany({
      where: { userId: user.id, skillId: skill.id },
      orderBy: { createdAt: 'desc' },
    }),
    computeSkillGaps(user.id),
  ])

  const gap = gaps.find((g) => g.skillId === skill.id)
  const strength = studentSkill?.highestStrength ?? 'MISSING'

  return (
    <div className="space-y-6">
      <div>
        <Link href="/evidence" className="text-xs font-medium text-slate-500 hover:text-slate-900">
          ← Back to Skill Evidence
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">{skill.name}</h2>
            <p className="text-xs text-slate-500">
              {skill.category.charAt(0) + skill.category.slice(1).toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Evidence strength</span>
            <EvidenceBadge strength={strength} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evidence</CardTitle>
            <CardDescription>Artifacts LaunchProof found that support this skill.</CardDescription>
          </CardHeader>
          <CardContent>
            {evidences.length === 0 ? (
              <EmptyState
                title="No supporting evidence found"
                description={`Nothing in your analyzed repositories or résumé demonstrates ${skill.name} yet. Building a real artifact for it is what moves this from missing to strong.`}
              />
            ) : (
              <div className="space-y-3">
                {evidences.map((e) => {
                  const citations = Array.isArray((e.metadata as { citations?: unknown })?.citations)
                    ? ((e.metadata as { citations: string[] }).citations ?? [])
                    : []
                  return (
                    <div key={e.id} className="rounded-md border border-slate-100 p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <Badge variant="outline">{SOURCE_LABEL[e.sourceType]}</Badge>
                        <EvidenceBadge strength={e.strength} />
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600">{e.description}</p>
                      {citations.length > 0 && (
                        <ul className="mt-2 space-y-0.5">
                          {citations.map((c, i) => (
                            <li key={i} className="font-mono text-[11px] text-slate-400">
                              {c}
                            </li>
                          ))}
                        </ul>
                      )}
                      {e.evidenceUrl && (
                        <a
                          href={e.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
                        >
                          View source <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target-market demand</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gap ? (
              <>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {gap.marketCount}
                    <span className="text-base font-normal text-slate-400"> of {gap.totalJobs}</span>
                  </p>
                  <p className="text-xs text-slate-500">target jobs mention this skill</p>
                </div>
                <div className="flex gap-4 border-t border-slate-100 pt-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">{gap.requiredCount}</p>
                    <p className="text-slate-500">required</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{gap.preferredCount}</p>
                    <p className="text-slate-500">preferred</p>
                  </div>
                </div>
                <p className="border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
                  {gap.explanation}
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-500">
                None of your saved target jobs mention this skill, so it currently carries no market demand signal.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

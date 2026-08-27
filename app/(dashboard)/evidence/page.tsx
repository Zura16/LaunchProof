import Link from 'next/link'
import { ShieldCheck, Github, ChevronRight } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { computeSkillGaps } from '@/lib/services/gap-analysis.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import type { EvidenceStrength } from '@prisma/client'

const GROUPS: { strength: EvidenceStrength; label: string; description: string }[] = [
  { strength: 'STRONG', label: 'Strong evidence', description: 'Demonstrated by real, checkable artifacts.' },
  { strength: 'MODERATE', label: 'Moderate evidence', description: 'Real evidence exists, but without depth.' },
  { strength: 'WEAK', label: 'Weak evidence', description: 'Thin supporting evidence.' },
  { strength: 'SELF_REPORTED', label: 'Self-reported', description: 'Claimed, but no artifact backs it up.' },
]

interface SkillRow {
  skillId: string
  name: string
  artifactCount: number
  marketCount: number
  totalJobs: number
}

function SkillLink({ row }: { row: SkillRow }) {
  return (
    <Link
      href={`/evidence/${row.skillId}`}
      className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
    >
      <span className="font-medium text-slate-900">{row.name}</span>
      <span className="flex items-center gap-3 text-xs text-slate-400">
        <span>
          {row.artifactCount} artifact{row.artifactCount === 1 ? '' : 's'}
        </span>
        {row.marketCount > 0 && (
          <span className="text-slate-500">
            {row.marketCount}/{row.totalJobs} jobs
          </span>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  )
}

export default async function EvidencePage() {
  const user = await requireUser()

  const [studentSkills, evidences, gaps, githubAccount, resume] = await Promise.all([
    prisma.studentSkill.findMany({ where: { userId: user.id }, include: { skill: true } }),
    prisma.evidence.findMany({ where: { userId: user.id }, select: { skillId: true } }),
    computeSkillGaps(user.id),
    prisma.gitHubAccount.findUnique({ where: { userId: user.id } }),
    prisma.resume.findFirst({ where: { userId: user.id } }),
  ])

  const hasEvidenceSources = !!githubAccount || !!resume

  if (studentSkills.length === 0 && gaps.length === 0) {
    return (
      <EmptyState
        icon={<ShieldCheck className="h-5 w-5" />}
        title="No evidence yet"
        description="Connect your work so LaunchProof can distinguish skills you've actually demonstrated from skills you've only listed."
        action={
          <Link href="/onboarding?step=4">
            <Button size="sm">
              <Github className="h-4 w-4" />
              Connect GitHub
            </Button>
          </Link>
        }
      />
    )
  }

  const artifactCountBySkill = new Map<string, number>()
  for (const e of evidences) {
    artifactCountBySkill.set(e.skillId, (artifactCountBySkill.get(e.skillId) ?? 0) + 1)
  }
  const gapBySkillId = new Map(gaps.map((g) => [g.skillId, g]))
  const totalJobs = gaps[0]?.totalJobs ?? 0

  const toRow = (skillId: string, name: string): SkillRow => ({
    skillId,
    name,
    artifactCount: artifactCountBySkill.get(skillId) ?? 0,
    marketCount: gapBySkillId.get(skillId)?.marketCount ?? 0,
    totalJobs,
  })

  // Skills the market wants that the student has no evidence for at all.
  const missingHighValue = gaps
    .filter((g) => g.currentEvidence === 'MISSING')
    .sort((a, b) => b.priorityScore - a.priorityScore)

  return (
    <div className="space-y-6">
      {!hasEvidenceSources && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="py-3 text-xs text-amber-800">
            You haven&apos;t connected GitHub or uploaded a résumé, so LaunchProof can only report what it was told —
            not what it verified.
          </CardContent>
        </Card>
      )}

      {GROUPS.map((g) => {
        const items = studentSkills.filter((s) => s.highestStrength === g.strength)
        if (items.length === 0) return null
        return (
          <Card key={g.strength}>
            <CardHeader>
              <CardTitle>{g.label}</CardTitle>
              <CardDescription>{g.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {items.map((s) => (
                <SkillLink key={s.id} row={toRow(s.skillId, s.skill.name)} />
              ))}
            </CardContent>
          </Card>
        )
      })}

      {missingHighValue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missing high-value skills</CardTitle>
            <CardDescription>
              Demanded across your target jobs, with no supporting evidence found in your work.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {missingHighValue.map((g) => (
              <Link
                key={g.skillId}
                href={`/evidence/${g.skillId}`}
                className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <span className="font-medium text-slate-900">{g.skillName}</span>
                <span className="flex items-center gap-3">
                  <Badge variant="destructive">
                    {g.marketCount}/{g.totalJobs} jobs
                  </Badge>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

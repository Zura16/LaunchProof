import Link from 'next/link'
import { ShieldCheck, Github } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import type { EvidenceStrength } from '@prisma/client'

const GROUPS: { strength: EvidenceStrength; label: string }[] = [
  { strength: 'STRONG', label: 'Strong evidence' },
  { strength: 'MODERATE', label: 'Moderate evidence' },
  { strength: 'WEAK', label: 'Weak evidence' },
  { strength: 'SELF_REPORTED', label: 'Self-reported' },
]

export default async function EvidencePage() {
  const user = await requireUser()

  const [studentSkills, evidences, missingGaps, hasGithub, hasResume] = await Promise.all([
    prisma.studentSkill.findMany({
      where: { userId: user.id },
      include: { skill: true },
    }),
    prisma.evidence.findMany({ where: { userId: user.id }, select: { skillId: true } }),
    prisma.skillGap.findMany({
      where: { userId: user.id, currentEvidence: 'MISSING' },
      include: { skill: true },
      orderBy: { priorityScore: 'desc' },
    }),
    prisma.gitHubAccount.findUnique({ where: { userId: user.id } }),
    prisma.resume.findFirst({ where: { userId: user.id } }),
  ])

  if (studentSkills.length === 0 && missingGaps.length === 0) {
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

  const evidenceCountBySkill = new Map<string, number>()
  for (const e of evidences) {
    evidenceCountBySkill.set(e.skillId, (evidenceCountBySkill.get(e.skillId) ?? 0) + 1)
  }

  return (
    <div className="space-y-6">
      {!hasGithub && !hasResume && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="py-3 text-xs text-amber-800">
            You haven&apos;t connected GitHub or uploaded a résumé — evidence shown below may be incomplete.
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
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {items.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-900">{s.skill.name}</span>
                  <span className="text-xs text-slate-400">
                    {evidenceCountBySkill.get(s.skillId) ?? 0} artifact
                    {(evidenceCountBySkill.get(s.skillId) ?? 0) === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      {missingGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missing high-value skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {missingGaps.map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
                <span className="font-medium text-slate-900">{g.skill.name}</span>
                <Badge variant="destructive">{g.marketCount} target jobs</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

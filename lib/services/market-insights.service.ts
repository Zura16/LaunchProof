import { prisma } from '@/lib/db/prisma'
import { computePriorityScore, priorityLabel } from '@/lib/services/priority.service'
import type { EvidenceStrength } from '@prisma/client'

export interface MarketSkillRow {
  skillId: string
  skillName: string
  jobsMentioning: number
  totalJobs: number
  frequencyPercent: number
  requiredCount: number
  preferredCount: number
  evidenceStrength: EvidenceStrength
  priority: 'High' | 'Medium' | 'Low'
}

export async function getMarketInsights(userId: string): Promise<MarketSkillRow[]> {
  const savedJobs = await prisma.savedJob.findMany({
    where: { userId },
    include: { jobPosting: { include: { requirements: { include: { skill: true } } } } },
  })
  const totalJobs = savedJobs.length
  if (totalJobs === 0) return []

  const studentSkills = await prisma.studentSkill.findMany({ where: { userId } })
  const strengthBySkillId = new Map(studentSkills.map((s) => [s.skillId, s.highestStrength]))

  const bySkill = new Map<string, { name: string; jobIds: Set<string>; required: number; preferred: number }>()

  for (const saved of savedJobs) {
    for (const req of saved.jobPosting.requirements) {
      const entry = bySkill.get(req.skillId) ?? {
        name: req.skill.name,
        jobIds: new Set<string>(),
        required: 0,
        preferred: 0,
      }
      entry.jobIds.add(saved.jobPostingId)
      if (req.type === 'REQUIRED') entry.required += 1
      if (req.type === 'PREFERRED') entry.preferred += 1
      bySkill.set(req.skillId, entry)
    }
  }

  const rows: MarketSkillRow[] = Array.from(bySkill.entries()).map(([skillId, data]) => {
    const jobsMentioning = data.jobIds.size
    const frequencyPercent = Math.round((jobsMentioning / totalJobs) * 100)
    const evidenceStrength = strengthBySkillId.get(skillId) ?? 'MISSING'
    const score = computePriorityScore(frequencyPercent, evidenceStrength)
    return {
      skillId,
      skillName: data.name,
      jobsMentioning,
      totalJobs,
      frequencyPercent,
      requiredCount: data.required,
      preferredCount: data.preferred,
      evidenceStrength,
      priority: priorityLabel(score),
    }
  })

  return rows.sort((a, b) => b.frequencyPercent - a.frequencyPercent)
}

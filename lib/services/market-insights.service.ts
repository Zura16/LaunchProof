import { computeSkillGaps, priorityLabel } from '@/lib/services/gap-analysis.service'
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
  explanation: string
}

// Market Insights is the same aggregation the gap engine already performs,
// presented demand-first (sorted by frequency) rather than action-first.
export async function getMarketInsights(userId: string): Promise<MarketSkillRow[]> {
  const gaps = await computeSkillGaps(userId)

  return gaps
    .map((g) => ({
      skillId: g.skillId,
      skillName: g.skillName,
      jobsMentioning: g.marketCount,
      totalJobs: g.totalJobs,
      frequencyPercent: g.marketPercent,
      requiredCount: g.requiredCount,
      preferredCount: g.preferredCount,
      evidenceStrength: g.currentEvidence,
      priority: priorityLabel(g.priorityScore),
      explanation: g.explanation,
    }))
    .sort((a, b) => b.frequencyPercent - a.frequencyPercent || b.jobsMentioning - a.jobsMentioning)
}

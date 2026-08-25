import type { EvidenceStrength } from '@prisma/client'

// Deterministic action-priority label: market frequency x evidence gap.
// Not shown to users as a raw number — only as High/Medium/Low, per product
// requirement that priority explanations stay in plain language.
const EVIDENCE_GAP_WEIGHT: Record<EvidenceStrength, number> = {
  MISSING: 1,
  WEAK: 0.7,
  SELF_REPORTED: 0.5,
  MODERATE: 0.3,
  STRONG: 0,
}

export function computePriorityScore(marketPercent: number, evidenceStrength: EvidenceStrength): number {
  return (marketPercent / 100) * EVIDENCE_GAP_WEIGHT[evidenceStrength]
}

export function priorityLabel(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 0.4) return 'High'
  if (score >= 0.15) return 'Medium'
  return 'Low'
}

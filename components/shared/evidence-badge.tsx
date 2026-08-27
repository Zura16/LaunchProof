import type { EvidenceStrength } from '@prisma/client'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import type { FitClassification } from '@/lib/services/job-fit.service'

const EVIDENCE_LABEL: Record<FitClassification, string> = {
  STRONG: 'Strong',
  MODERATE: 'Moderate',
  WEAK: 'Weak',
  SELF_REPORTED: 'Self-reported',
  MISSING: 'Missing',
  UNKNOWN: 'Unknown',
}

const EVIDENCE_VARIANT: Record<FitClassification, BadgeProps['variant']> = {
  STRONG: 'success',
  MODERATE: 'info',
  WEAK: 'warning',
  SELF_REPORTED: 'outline',
  MISSING: 'destructive',
  UNKNOWN: 'outline',
}

function EvidenceBadge({ strength }: { strength: EvidenceStrength }) {
  return <Badge variant={EVIDENCE_VARIANT[strength]}>{EVIDENCE_LABEL[strength]}</Badge>
}

function FitBadge({ classification }: { classification: FitClassification }) {
  return <Badge variant={EVIDENCE_VARIANT[classification]}>{EVIDENCE_LABEL[classification]}</Badge>
}

export { EvidenceBadge, FitBadge, EVIDENCE_LABEL, EVIDENCE_VARIANT }

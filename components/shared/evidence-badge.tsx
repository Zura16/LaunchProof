import type { EvidenceStrength } from '@prisma/client'
import { Badge, type BadgeProps } from '@/components/ui/badge'

const EVIDENCE_LABEL: Record<EvidenceStrength, string> = {
  STRONG: 'Strong',
  MODERATE: 'Moderate',
  WEAK: 'Weak',
  SELF_REPORTED: 'Self-reported',
  MISSING: 'Missing',
}

const EVIDENCE_VARIANT: Record<EvidenceStrength, BadgeProps['variant']> = {
  STRONG: 'success',
  MODERATE: 'info',
  WEAK: 'warning',
  SELF_REPORTED: 'outline',
  MISSING: 'destructive',
}

function EvidenceBadge({ strength }: { strength: EvidenceStrength }) {
  return <Badge variant={EVIDENCE_VARIANT[strength]}>{EVIDENCE_LABEL[strength]}</Badge>
}

export { EvidenceBadge, EVIDENCE_LABEL, EVIDENCE_VARIANT }

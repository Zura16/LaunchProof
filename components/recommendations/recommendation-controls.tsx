'use client'

import { useFormStatus } from 'react-dom'
import { RefreshCw, X } from 'lucide-react'
import {
  regenerateRecommendationsAction,
  dismissRecommendationAction,
  createProjectPlanAction,
} from '@/app/(dashboard)/recommendations/actions'
import { Button } from '@/components/ui/button'

function PendingButton({
  idle,
  pendingLabel,
  variant = 'default',
  size = 'sm',
  icon,
}: {
  idle: string
  pendingLabel: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default'
  icon?: React.ReactNode
}) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size={size} variant={variant} disabled={pending}>
      {icon}
      {pending ? pendingLabel : idle}
    </Button>
  )
}

export function RegenerateButton() {
  return (
    <form action={regenerateRecommendationsAction}>
      <PendingButton
        idle="Regenerate"
        pendingLabel="Recalculating…"
        variant="outline"
        icon={<RefreshCw className="h-3.5 w-3.5" />}
      />
    </form>
  )
}

export function CreatePlanButton({ recommendationId }: { recommendationId: string }) {
  return (
    <form action={createProjectPlanAction.bind(null, recommendationId)}>
      <PendingButton idle="Create Project Plan" pendingLabel="Building plan…" />
    </form>
  )
}

export function DismissButton({ recommendationId }: { recommendationId: string }) {
  return (
    <form action={dismissRecommendationAction.bind(null, recommendationId)}>
      <PendingButton idle="Dismiss" pendingLabel="Dismissing…" variant="ghost" icon={<X className="h-3.5 w-3.5" />} />
    </form>
  )
}

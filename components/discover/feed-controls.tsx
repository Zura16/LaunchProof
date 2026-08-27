'use client'

import { useFormStatus } from 'react-dom'
import { RefreshCw, Plus } from 'lucide-react'
import { refreshFeedAction, saveFeedJobAction } from '@/app/(dashboard)/discover/actions'
import { Button } from '@/components/ui/button'

function Pending({ idle, busy, variant = 'default' }: { idle: string; busy: string; variant?: 'default' | 'outline' }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" variant={variant} disabled={pending}>
      {variant === 'outline' ? (
        <RefreshCw className={pending ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} aria-hidden="true" />
      ) : (
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {pending ? busy : idle}
    </Button>
  )
}

export function RefreshFeedButton() {
  return (
    <form action={refreshFeedAction}>
      <Pending idle="Refresh feed" busy="Checking boards…" variant="outline" />
    </form>
  )
}

export function SaveFeedJobButton({ feedJobId }: { feedJobId: string }) {
  return (
    <form action={saveFeedJobAction.bind(null, feedJobId)}>
      <Pending idle="Save & analyze" busy="Saving…" />
    </form>
  )
}

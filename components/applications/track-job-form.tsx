'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Plus } from 'lucide-react'
import { trackApplicationAction } from '@/app/(dashboard)/applications/actions'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

interface Props {
  untracked: { savedJobId: string; label: string }[]
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={disabled || pending}>
      <Plus className="h-3.5 w-3.5" />
      {pending ? 'Adding…' : 'Track'}
    </Button>
  )
}

export function TrackJobForm({ untracked }: Props) {
  const [savedJobId, setSavedJobId] = useState('')

  if (untracked.length === 0) {
    return <p className="text-xs text-slate-400">All saved jobs are already being tracked.</p>
  }

  return (
    <form
      action={async () => {
        if (savedJobId) await trackApplicationAction(savedJobId)
      }}
      className="flex items-center gap-2"
    >
      <label htmlFor="track-job" className="sr-only">
        Saved job to track
      </label>
      <Select
        id="track-job"
        value={savedJobId}
        onChange={(e) => setSavedJobId(e.target.value)}
        className="h-8 w-64 text-xs"
      >
        <option value="">Track a saved job…</option>
        {untracked.map((j) => (
          <option key={j.savedJobId} value={j.savedJobId}>
            {j.label}
          </option>
        ))}
      </Select>
      <SubmitButton disabled={!savedJobId} />
    </form>
  )
}

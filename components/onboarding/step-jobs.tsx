'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Briefcase, CheckCircle2 } from 'lucide-react'
import { saveOnboardingJob, completeOnboarding } from '@/app/onboarding/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SavedJobSummary {
  id: string
  company: string
  title: string
}

function AddJobButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? 'Saving…' : 'Save Job'}
    </Button>
  )
}

function FinishButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? 'Finishing…' : 'Finish Setup'}
    </Button>
  )
}

export function StepJobs({ savedJobs }: { savedJobs: SavedJobSummary[] }) {
  const [addState, addAction] = useFormState(saveOnboardingJob, undefined)
  const [finishState, finishAction] = useFormState(completeOnboarding, undefined)
  const minReached = savedJobs.length >= 3

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-medium text-slate-500">
          {savedJobs.length} of 3 minimum target jobs saved
        </p>
        {savedJobs.length > 0 && (
          <ul className="mb-4 space-y-1.5">
            {savedJobs.map((j) => (
              <li key={j.id} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span className="font-medium text-slate-900">{j.company}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">{j.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form action={addAction} key={savedJobs.length} className="space-y-3 rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Briefcase className="h-3.5 w-3.5" />
          Add a target job
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Job title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location (optional)</Label>
            <Input id="location" name="location" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="url">Job URL (optional)</Label>
            <Input id="url" name="url" type="url" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Job description</Label>
          <Textarea id="description" name="description" rows={5} placeholder="Paste the full job description…" required />
        </div>
        {addState?.error && <p className="text-xs text-red-600">{addState.error}</p>}
        <div className="flex justify-end">
          <AddJobButton />
        </div>
      </form>

      <form action={finishAction} className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {minReached ? 'You can finish setup now, or keep adding jobs.' : 'Save at least 3 jobs to finish setup.'}
        </p>
        {finishState?.error && <p className="text-xs text-red-600">{finishState.error}</p>}
        <FinishButton disabled={!minReached} />
      </form>
    </div>
  )
}

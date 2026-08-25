'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { addJobAction } from '@/app/(dashboard)/jobs/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save Job'}
    </Button>
  )
}

export function AddJobForm() {
  const [state, formAction] = useFormState(addJobAction, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
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
        <Textarea id="description" name="description" rows={10} placeholder="Paste the full job description…" required />
      </div>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}

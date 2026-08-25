'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { saveCareerGoals } from '@/app/onboarding/actions'
import { ROLE_CATEGORIES, JOB_TYPES, REMOTE_PREFERENCES, WORK_AUTHORIZATIONS } from '@/schemas/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  SWE: 'Software Engineer',
  BACKEND: 'Backend Engineer',
  FRONTEND: 'Frontend Engineer',
  FULLSTACK: 'Full-Stack Engineer',
  MOBILE: 'Mobile Engineer',
  DATA: 'Data Engineer',
}

interface Props {
  initial: {
    targetRoleCategories: string[]
    preferredJobTypes: string[]
    preferredLocations: string[]
    remotePreference?: string
    workAuthorization?: string
    sponsorshipRequired?: boolean
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Continue'}
    </Button>
  )
}

export function StepCareerGoals({ initial }: Props) {
  const [state, formAction] = useFormState(saveCareerGoals, undefined)

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label>Target role categories</Label>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_CATEGORIES.map((r) => (
            <label
              key={r}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50'
              )}
            >
              <input
                type="checkbox"
                name="targetRoleCategories"
                value={r}
                defaultChecked={initial.targetRoleCategories.includes(r)}
                className="h-3.5 w-3.5 rounded border-slate-300"
              />
              {ROLE_LABELS[r]}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Looking for</Label>
        <div className="flex gap-2">
          {JOB_TYPES.map((t) => (
            <label
              key={t}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                name="preferredJobTypes"
                value={t}
                defaultChecked={initial.preferredJobTypes.includes(t)}
                className="h-3.5 w-3.5 rounded border-slate-300"
              />
              {t.replace('_', ' ')}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="preferredLocations">Preferred locations</Label>
        <Input
          id="preferredLocations"
          name="preferredLocations"
          placeholder="San Francisco, CA, New York, NY, Remote"
          defaultValue={initial.preferredLocations.join(', ')}
        />
        <p className="text-[11px] text-slate-400">Comma-separated</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="remotePreference">Remote preference</Label>
          <Select id="remotePreference" name="remotePreference" defaultValue={initial.remotePreference} required>
            <option value="" disabled>
              Select
            </option>
            {REMOTE_PREFERENCES.map((r) => (
              <option key={r} value={r}>
                {r.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="workAuthorization">Work authorization</Label>
          <Select id="workAuthorization" name="workAuthorization" defaultValue={initial.workAuthorization} required>
            <option value="" disabled>
              Select
            </option>
            {WORK_AUTHORIZATIONS.map((w) => (
              <option key={w} value={w}>
                {w.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="sponsorshipRequired"
          defaultChecked={initial.sponsorshipRequired}
          className="h-3.5 w-3.5 rounded border-slate-300"
        />
        I will require visa sponsorship
      </label>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="flex justify-end pt-2">
        <SubmitButton />
      </div>
    </form>
  )
}

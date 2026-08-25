'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { saveStudentInfo } from '@/app/onboarding/actions'
import { ACADEMIC_YEARS } from '@/schemas/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

interface Props {
  initial: {
    fullName?: string
    university?: string
    degree?: string
    major?: string
    graduationDate?: string
    academicYear?: string
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

export function StepStudentInfo({ initial }: Props) {
  const [state, formAction] = useFormState(saveStudentInfo, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" defaultValue={initial.fullName} required />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="university">University</Label>
          <Input id="university" name="university" defaultValue={initial.university} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="degree">Degree</Label>
          <Input id="degree" name="degree" placeholder="Bachelor of Science" defaultValue={initial.degree} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="major">Major</Label>
          <Input id="major" name="major" placeholder="Computer Science" defaultValue={initial.major} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="graduationDate">Expected graduation</Label>
          <Input
            id="graduationDate"
            name="graduationDate"
            type="date"
            defaultValue={initial.graduationDate}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="academicYear">Academic year</Label>
          <Select id="academicYear" name="academicYear" defaultValue={initial.academicYear} required>
            <option value="" disabled>
              Select year
            </option>
            {ACADEMIC_YEARS.map((y) => (
              <option key={y} value={y}>
                {y.charAt(0) + y.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="flex justify-end pt-2">
        <SubmitButton />
      </div>
    </form>
  )
}

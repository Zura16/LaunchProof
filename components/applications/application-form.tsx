'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { updateApplicationAction } from '@/app/(dashboard)/applications/actions'
import { APPLICATION_STATUSES, STATUS_LABEL, TERMINAL_STATUSES } from '@/schemas/application'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import type { ApplicationStatus } from '@prisma/client'

interface Props {
  applicationId: string
  initial: {
    status: ApplicationStatus
    appliedDate: string
    nextInterviewDate: string
    resumeId: string
    referralContact: string
    recruiterContact: string
    notes: string
    outcomeNote: string
    rejectionStage: string
  }
  resumes: { id: string; fileName: string }[]
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? 'Saving…' : 'Save changes'}
    </Button>
  )
}

export function ApplicationForm({ applicationId, initial, resumes }: Props) {
  const [state, formAction] = useFormState(updateApplicationAction.bind(null, applicationId), undefined)
  const [status, setStatus] = useState<ApplicationStatus>(initial.status)

  const isClosed = (TERMINAL_STATUSES as readonly string[]).includes(status)
  const isRejected = status === 'REJECTED'

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="resumeId">Résumé sent</Label>
          <Select id="resumeId" name="resumeId" defaultValue={initial.resumeId}>
            <option value="">Not recorded</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.fileName}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="appliedDate">Application date</Label>
          <Input id="appliedDate" name="appliedDate" type="date" defaultValue={initial.appliedDate} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nextInterviewDate">Next interview date</Label>
          <Input
            id="nextInterviewDate"
            name="nextInterviewDate"
            type="date"
            defaultValue={initial.nextInterviewDate}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="referralContact">Referral</Label>
          <Input
            id="referralContact"
            name="referralContact"
            placeholder="Who referred you, if anyone"
            defaultValue={initial.referralContact}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="recruiterContact">Recruiter / contact</Label>
          <Input
            id="recruiterContact"
            name="recruiterContact"
            placeholder="Name or email"
            defaultValue={initial.recruiterContact}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Interview prep, questions asked, follow-ups…"
          defaultValue={initial.notes}
        />
      </div>

      {isClosed && (
        <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="outcomeNote">Outcome notes</Label>
            <Textarea
              id="outcomeNote"
              name="outcomeNote"
              rows={3}
              placeholder="What happened, and anything worth remembering for next time"
              defaultValue={initial.outcomeNote}
            />
          </div>
          {isRejected && (
            <div className="space-y-1.5">
              <Label htmlFor="rejectionStage">Stage reached</Label>
              <Input
                id="rejectionStage"
                name="rejectionStage"
                placeholder="e.g. Technical interview"
                defaultValue={initial.rejectionStage}
              />
            </div>
          )}
        </div>
      )}

      {!isClosed && (
        <>
          <input type="hidden" name="outcomeNote" value={initial.outcomeNote} />
          <input type="hidden" name="rejectionStage" value={initial.rejectionStage} />
        </>
      )}

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </form>
  )
}

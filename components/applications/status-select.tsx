'use client'

import { useTransition } from 'react'
import { updateApplicationStatus } from '@/app/(dashboard)/applications/actions'
import { Select } from '@/components/ui/select'
import type { ApplicationStatus } from '@prisma/client'

const STATUSES: ApplicationStatus[] = [
  'SAVED',
  'PREPARING',
  'APPLIED',
  'ONLINE_ASSESSMENT',
  'RECRUITER_SCREEN',
  'TECHNICAL_INTERVIEW',
  'FINAL_INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
]

export function StatusSelect({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Select
      value={status}
      disabled={isPending}
      className="h-8 text-xs"
      onChange={(e) => {
        const next = e.target.value as ApplicationStatus
        startTransition(() => updateApplicationStatus(applicationId, next))
      }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace('_', ' ')}
        </option>
      ))}
    </Select>
  )
}

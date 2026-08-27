'use client'

import { useTransition } from 'react'
import { updateApplicationStatus } from '@/app/(dashboard)/applications/actions'
import { Select } from '@/components/ui/select'
import { APPLICATION_STATUSES, STATUS_LABEL } from '@/schemas/application'
import type { ApplicationStatus } from '@prisma/client'

export function StatusSelect({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Select
      aria-label="Application status"
      value={status}
      disabled={isPending}
      className="h-8 text-xs"
      onChange={(e) => {
        const next = e.target.value as ApplicationStatus
        startTransition(() => updateApplicationStatus(applicationId, next))
      }}
    >
      {APPLICATION_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </Select>
  )
}

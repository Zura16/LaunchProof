'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFormState, useFormStatus } from 'react-dom'
import { FileText, UploadCloud } from 'lucide-react'
import { uploadResumeAction } from '@/app/onboarding/actions'
import { Button } from '@/components/ui/button'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Uploading…' : 'Upload & Continue'}
    </Button>
  )
}

export function StepResume({
  existingFileName,
  uploadsAvailable = true,
}: {
  existingFileName?: string
  uploadsAvailable?: boolean
}) {
  const [state, formAction] = useFormState(uploadResumeAction, undefined)
  const [fileName, setFileName] = useState<string | null>(null)

  if (existingFileName) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
          <FileText className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-sm font-medium text-slate-900">{existingFileName}</p>
            <p className="text-xs text-slate-500">Uploaded — structured analysis is pending.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Link href="/onboarding?step=4">
            <Button>Continue</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!uploadsAvailable) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-amber-200 bg-amber-50/60 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">Résumé upload isn&apos;t available here</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">
            This deployment has no file storage configured, so uploads can&apos;t be kept. Everything else works —
            connect GitHub on the next step and LaunchProof will build your evidence from your code.
          </p>
        </div>
        <div className="flex justify-end">
          <Link href="/onboarding?step=4">
            <Button>Continue</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <label
        htmlFor="file"
        className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 px-6 py-10 text-center hover:border-slate-400"
      >
        <UploadCloud className="h-6 w-6 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">
          {fileName ?? 'Click to upload your résumé'}
        </span>
        <span className="text-xs text-slate-400">PDF only, up to 5MB</span>
        <input
          id="file"
          name="file"
          type="file"
          accept="application/pdf"
          className="sr-only"
          required
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="flex items-center justify-between pt-2">
        <Link href="/onboarding?step=4" className="text-xs font-medium text-slate-500 hover:text-slate-900">
          Skip for now
        </Link>
        <SubmitButton />
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { UploadCloud } from 'lucide-react'
import { uploadResumeGeneral } from '@/app/(dashboard)/resume/actions'
import { Button } from '@/components/ui/button'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? 'Uploading…' : 'Upload'}
    </Button>
  )
}

export function UploadResumeForm() {
  const [state, formAction] = useFormState(uploadResumeGeneral, undefined)
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label
        htmlFor="file"
        className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:border-slate-400"
      >
        <UploadCloud className="h-4 w-4 text-slate-400" />
        {fileName ?? 'Choose a PDF résumé to upload'}
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
      <SubmitButton />
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  )
}

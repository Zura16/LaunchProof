'use client'

import { useFormStatus } from 'react-dom'
import { FileSearch } from 'lucide-react'
import { analyzeResumeAction } from '@/app/(dashboard)/resume/actions'
import { Button } from '@/components/ui/button'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" variant={label === 'Re-analyze' ? 'outline' : 'default'} disabled={pending}>
      <FileSearch className="h-3.5 w-3.5" />
      {pending ? 'Analyzing…' : label}
    </Button>
  )
}

export function AnalyzeResumeButton({ resumeId, analyzed }: { resumeId: string; analyzed: boolean }) {
  return (
    <form action={analyzeResumeAction.bind(null, resumeId)}>
      <SubmitButton label={analyzed ? 'Re-analyze' : 'Analyze Résumé'} />
    </form>
  )
}

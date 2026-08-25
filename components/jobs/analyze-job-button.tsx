'use client'

import { useFormStatus } from 'react-dom'
import { FileSearch } from 'lucide-react'
import { analyzeJobAction } from '@/app/(dashboard)/jobs/actions'
import { Button } from '@/components/ui/button'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      <FileSearch className="h-3.5 w-3.5" />
      {pending ? 'Analyzing…' : 'Analyze Job'}
    </Button>
  )
}

export function AnalyzeJobButton({ savedJobId }: { savedJobId: string }) {
  return (
    <form action={analyzeJobAction.bind(null, savedJobId)}>
      <SubmitButton />
    </form>
  )
}

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Onboarding sits outside the (dashboard) route group, so it did not inherit
 * that group's error boundary — any failure here fell all the way through to
 * the global handler and showed "LaunchProof failed to load", which reads
 * like the whole app is broken when only one step failed.
 */
export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Onboarding error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
          <h1 className="text-sm font-semibold text-slate-900">This step didn&apos;t load</h1>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Something went wrong setting up your account. Anything you already saved has been kept — you can retry
          this step or skip ahead and come back to it later.
        </p>
        {error.digest && <p className="mt-2 font-mono text-[11px] text-slate-400">Reference: {error.digest}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={reset}>
            Try again
          </Button>
          <Link href="/onboarding?step=5">
            <Button size="sm" variant="outline">
              Skip to the last step
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" variant="ghost">
              Go to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

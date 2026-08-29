'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Sign-in is also outside the (dashboard) group and needs its own boundary. */
export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Login error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-red-600" aria-hidden="true" />
        <h1 className="text-sm font-semibold text-slate-900">Sign-in is unavailable</h1>
        <p className="mt-1 text-sm text-slate-600">
          We couldn&apos;t load the sign-in options. This is usually temporary.
        </p>
        {error.digest && <p className="mt-2 font-mono text-[11px] text-slate-400">Reference: {error.digest}</p>}
        <div className="mt-5 flex justify-center gap-2">
          <Button size="sm" onClick={reset}>
            Try again
          </Button>
          <Link href="/">
            <Button size="sm" variant="outline">
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

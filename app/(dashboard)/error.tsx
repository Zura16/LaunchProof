'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard route error:', error)
  }, [error])

  return (
    <Card className="border-red-200">
      <CardContent className="flex flex-col items-start gap-3 py-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-900">Something went wrong on this page</h2>
        </div>
        <p className="max-w-prose text-sm text-slate-600">
          This section failed to load. Your saved data is unaffected — retrying usually resolves it. If it keeps
          happening, the analysis service or database may be unavailable.
        </p>
        {error.digest && <p className="font-mono text-[11px] text-slate-400">Reference: {error.digest}</p>}
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" onClick={reset}>
            Try again
          </Button>
          <Link href="/dashboard">
            <Button size="sm" variant="outline">
              Back to dashboard
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

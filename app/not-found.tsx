import Link from 'next/link'
import { Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-5 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Rocket className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-lg font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          This page doesn&apos;t exist, or the record it pointed to has been deleted.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/dashboard">
            <Button size="sm">Go to dashboard</Button>
          </Link>
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

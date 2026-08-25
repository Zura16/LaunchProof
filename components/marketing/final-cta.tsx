import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FinalCta() {
  return (
    <section className="border-t border-slate-200 bg-white py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Find out what you should build next.
        </h2>
        <div className="mt-6">
          <Link href="/login">
            <Button size="lg">
              Analyze My Career Profile
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

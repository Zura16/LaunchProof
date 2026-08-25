import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardPreview } from '@/components/marketing/dashboard-preview'

export function Hero() {
  return (
    <section className="px-6 pb-20 pt-20 text-center sm:pt-28">
      <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
        Stop guessing what employers want.
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
        LaunchProof analyzes the jobs you&apos;re targeting, compares them against what you&apos;ve actually built,
        and tells you what to improve next.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/login">
          <Button size="lg">
            Analyze My Career Profile
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <a href="#demo">
          <Button size="lg" variant="outline">
            <Play className="h-4 w-4" />
            View Demo
          </Button>
        </a>
      </div>

      <div className="mt-16">
        <DashboardPreview />
      </div>
    </section>
  )
}

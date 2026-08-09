import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import { HighestImpactActions } from '@/components/dashboard/highest-impact-actions'
import { Lightbulb } from 'lucide-react'

export default function RecommendationsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-slate-900" />
          <span>Evidence-Based Recommendations</span>
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Prioritized career roadmap tailored to your specific saved jobs and evidence gaps.
        </p>
      </div>

      <HighestImpactActions recommendations={ALEX_CHEN_SEED.recommendations} />
    </div>
  )
}

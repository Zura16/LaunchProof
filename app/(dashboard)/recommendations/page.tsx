import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'
import { HighestImpactActions } from '@/components/dashboard/highest-impact-actions'
import { Lightbulb } from 'lucide-react'

export default function RecommendationsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          <span>Evidence-Based Recommendations</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Prioritized career roadmap tailored to your specific saved jobs and evidence gaps.
        </p>
      </div>

      <HighestImpactActions recommendations={ALEX_CHEN_SEED.recommendations} />
    </div>
  )
}

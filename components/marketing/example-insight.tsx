import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EvidenceBadge } from '@/components/shared/evidence-badge'

const DEMAND = [
  { name: 'REST APIs', percent: 67 },
  { name: 'SQL', percent: 56 },
  { name: 'Testing', percent: 50 },
  { name: 'AWS', percent: 44 },
]

const EVIDENCE = [
  { name: 'REST APIs', strength: 'STRONG' as const },
  { name: 'SQL', strength: 'WEAK' as const },
  { name: 'Testing', strength: 'MISSING' as const },
  { name: 'AWS', strength: 'MISSING' as const },
]

export function ExampleInsight() {
  return (
    <section id="demo" className="mx-auto max-w-4xl px-6 py-20">
      <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Based on 18 target jobs
      </h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>What employers ask for</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMAND.map((d) => (
              <div key={d.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{d.name}</span>
                  <span className="text-slate-400">{d.percent}%</span>
                </div>
                <Progress value={d.percent} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your evidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {EVIDENCE.map((e) => (
              <div key={e.name} className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{e.name}</span>
                <EvidenceBadge strength={e.strength} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Recommended action</p>
            <p className="text-sm font-semibold text-slate-900">Upgrade CampusConnect</p>
          </div>
          <p className="text-xs text-slate-500 sm:max-w-xs sm:text-right">
            Add automated testing, PostgreSQL improvements, CI, and cloud deployment.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}

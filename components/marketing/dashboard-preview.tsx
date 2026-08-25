import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

const MARKET_SKILLS = [
  { name: 'REST APIs', count: 12, total: 18 },
  { name: 'SQL', count: 10, total: 18 },
  { name: 'Testing', count: 9, total: 18 },
  { name: 'AWS', count: 8, total: 18 },
]

export function DashboardPreview() {
  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/5">
      <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 text-left sm:grid-cols-5">
        <Card className="sm:col-span-3">
          <CardHeader>
            <CardTitle>Highest-Impact Action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">Upgrade CampusConnect</p>
            <p className="text-xs leading-relaxed text-slate-500">
              Testing appears in <span className="font-medium text-slate-700">9 of your 17 target jobs</span>. No
              meaningful testing evidence was found in your projects.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant="outline">Jest</Badge>
              <Badge variant="outline">Integration Testing</Badge>
              <Badge variant="outline">CI/CD</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle>Market Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {MARKET_SKILLS.map((s) => (
              <div key={s.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <span className="text-slate-400">
                    {s.count}/{s.total}
                  </span>
                </div>
                <Progress value={s.count} max={s.total} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

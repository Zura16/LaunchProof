import Link from 'next/link'
import { BarChart3 } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { getMarketInsights } from '@/lib/services/market-insights.service'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { EvidenceBadge } from '@/components/shared/evidence-badge'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const FILTERS = [
  { key: 'all', label: 'All skills' },
  { key: 'missing', label: 'Missing' },
  { key: 'weak', label: 'Weak' },
  { key: 'strong', label: 'Strong' },
  { key: 'required', label: 'Required frequently' },
] as const

const PRIORITY_VARIANT = { High: 'destructive', Medium: 'warning', Low: 'outline' } as const

export default async function MarketInsightsPage({ searchParams }: { searchParams: { filter?: string } }) {
  const user = await requireUser()
  const savedJobCount = await prisma.savedJob.count({ where: { userId: user.id } })

  if (savedJobCount < 3) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-5 w-5" />}
        title="Save a few more target jobs to identify meaningful patterns"
        description={`You have ${savedJobCount} saved job${savedJobCount === 1 ? '' : 's'}. Market Insights needs at least 3 to surface recurring skill demand.`}
        action={
          <Link href="/jobs/new">
            <Button size="sm">Add Target Job</Button>
          </Link>
        }
      />
    )
  }

  const rows = await getMarketInsights(user.id)
  const filter = searchParams.filter ?? 'all'
  const filtered = rows.filter((r) => {
    if (filter === 'missing') return r.evidenceStrength === 'MISSING'
    if (filter === 'weak') return r.evidenceStrength === 'WEAK'
    if (filter === 'strong') return r.evidenceStrength === 'STRONG'
    if (filter === 'required') return r.requiredCount >= 3
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/market-insights' : `/market-insights?filter=${f.key}`}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium',
              filter === f.key ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No skills match this filter" description="Try a different filter, or save more target jobs." />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Jobs mentioning</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Preferred</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.skillId}>
                  <TableCell className="font-medium text-slate-900">
                    <Link href={`/evidence/${r.skillId}`} className="hover:underline">
                      {r.skillName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {r.jobsMentioning} / {r.totalJobs}
                  </TableCell>
                  <TableCell>{r.frequencyPercent}%</TableCell>
                  <TableCell>{r.requiredCount}</TableCell>
                  <TableCell>{r.preferredCount}</TableCell>
                  <TableCell>
                    <EvidenceBadge strength={r.evidenceStrength} />
                  </TableCell>
                  <TableCell>
                    <Tooltip content={r.explanation}>
                      <Badge variant={PRIORITY_VARIANT[r.priority]}>{r.priority}</Badge>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

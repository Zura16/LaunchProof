import Link from 'next/link'
import { Compass, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { computeFeedFit } from '@/lib/services/feed-fit.service'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { RefreshFeedButton, SaveFeedJobButton } from '@/components/discover/feed-controls'
import { cn } from '@/lib/utils'

const FILTERS = [
  { key: 'mine', label: 'My companies' },
  { key: 'new', label: 'Newest' },
  { key: 'fit', label: 'Best evidence fit' },
  { key: 'remote', label: 'Remote' },
] as const

function relativeTime(date: Date): string {
  const hours = Math.floor((Date.now() - date.getTime()) / 3_600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString(undefined, { timeZone: 'UTC' })
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: { filter?: string; added?: string; feedError?: string }
}) {
  const user = await requireUser()

  const [feedJobs, sources, savedUrls, profile] = await Promise.all([
    prisma.feedJob.findMany({ orderBy: [{ postedAt: 'desc' }, { firstSeenAt: 'desc' }], take: 120 }),
    prisma.jobSource.findMany({ where: { isActive: true }, select: { companyName: true, lastFetchedAt: true, lastError: true } }),
    prisma.savedJob
      .findMany({ where: { userId: user.id }, select: { jobPosting: { select: { url: true } } } })
      .then((rows) => new Set(rows.map((r) => r.jobPosting.url).filter(Boolean) as string[])),
    prisma.studentProfile.findUnique({
      where: { userId: user.id },
      select: { targetCompanies: true },
    }),
  ])

  const targetCompanies = profile?.targetCompanies ?? []
  const targetSet = new Set(targetCompanies.map((c) => c.toLowerCase()))

  const fits = await computeFeedFit(
    user.id,
    feedJobs.map((j) => ({ id: j.id, title: j.title, descriptionText: j.descriptionText }))
  )

  const defaultFilter = targetCompanies.length > 0 ? 'mine' : 'new'
  const filter = (searchParams.filter ?? defaultFilter) as (typeof FILTERS)[number]['key']

  let visible = [...feedJobs]
  if (filter === 'mine') visible = visible.filter((j) => targetSet.has(j.company.toLowerCase()))
  if (filter === 'remote') visible = visible.filter((j) => j.isRemote)
  if (filter === 'fit') {
    visible.sort((a, b) => {
      const fa = fits.get(a.id)
      const fb = fits.get(b.id)
      return (fb?.proven.length ?? 0) - (fa?.proven.length ?? 0)
    })
  }

  const lastFetched = sources
    .map((s) => s.lastFetchedAt)
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime())[0]

  const brokenSources = sources.filter((s) => s.lastError)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            New internship and new-grad engineering roles, pulled from company job boards.
          </p>
          <p className="text-xs text-slate-400">
            {sources.length} companies tracked
            {lastFetched ? ` · last checked ${relativeTime(lastFetched)}` : ' · never checked'}
          </p>
        </div>
        <RefreshFeedButton />
      </div>

      {searchParams.feedError && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="flex items-start gap-2 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
            <p className="text-xs text-red-800">{searchParams.feedError}</p>
          </CardContent>
        </Card>
      )}

      {searchParams.added && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="flex items-start gap-2 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <p className="text-xs text-emerald-800">
              {searchParams.added === '0'
                ? 'Feed is up to date — no new postings since the last check.'
                : `${searchParams.added} new posting${searchParams.added === '1' ? '' : 's'} found.`}
            </p>
          </CardContent>
        </Card>
      )}

      {brokenSources.length > 0 && (
        <p className="text-xs text-amber-700">
          {brokenSources.length} board{brokenSources.length === 1 ? '' : 's'} could not be reached on the last
          check ({brokenSources.map((s) => s.companyName).join(', ')}).
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.filter((f) => f.key !== 'mine' || targetCompanies.length > 0).map((f) => (
          <Link
            key={f.key}
            href={f.key === defaultFilter ? '/discover' : `/discover?filter=${f.key}`}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium',
              filter === f.key
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Compass className="h-5 w-5" />}
          title={
            feedJobs.length === 0
              ? 'No postings discovered yet'
              : filter === 'mine'
                ? 'No open roles at your companies right now'
                : 'Nothing matches this filter'
          }
          description={
            feedJobs.length === 0
              ? 'Refresh the feed to pull the latest internship and new-grad engineering roles from tracked company job boards.'
              : filter === 'mine'
                ? `Nothing is open at ${targetCompanies.slice(0, 3).join(', ')}${targetCompanies.length > 3 ? ' and others' : ''} yet. Browse everything under Newest, or adjust your companies in Settings.`
                : 'Try a different filter, or refresh the feed.'
          }
          action={feedJobs.length === 0 ? <RefreshFeedButton /> : undefined}
        />
      ) : (
        <div className="space-y-2">
          {visible.map((job) => {
            const fit = fits.get(job.id)
            const alreadySaved = savedUrls.has(job.url)
            return (
              <Card key={job.id}>
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{job.title}</p>
                      {job.isRemote && <Badge variant="outline">Remote</Badge>}
                    </div>
                    <p className="text-xs text-slate-500">
                      {job.company}
                      {job.location ? ` · ${job.location}` : ''}
                      {job.postedAt ? ` · posted ${relativeTime(job.postedAt)}` : ` · seen ${relativeTime(job.firstSeenAt)}`}
                    </p>

                    {fit && fit.matchedTotal > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {fit.proven.slice(0, 4).map((s) => (
                          <Badge key={s} variant="success">
                            {s}
                          </Badge>
                        ))}
                        {fit.gaps.slice(0, 3).map((s) => (
                          <Badge key={s} variant="warning">
                            {s}
                          </Badge>
                        ))}
                        {fit.unknownToStudent.slice(0, 3).map((s) => (
                          <Badge key={s} variant="destructive">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {fit && fit.matchedTotal > 0 && (
                      <p className="text-[11px] text-slate-400">
                        {fit.proven.length} you can prove · {fit.gaps.length + fit.unknownToStudent.length} you
                        can&apos;t yet — a first read from the posting text, not a full analysis
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      View <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                    {alreadySaved ? (
                      <Button size="sm" variant="secondary" disabled>
                        Saved
                      </Button>
                    ) : (
                      <SaveFeedJobButton feedJobId={job.id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

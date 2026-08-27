import { NextResponse } from 'next/server'
import { refreshJobFeed } from '@/lib/services/job-feed.service'

// Polling 74 boards took ~19s in practice; allow headroom as the list grows.
export const maxDuration = 300
export const dynamic = 'force-dynamic'

/**
 * Scheduled job-feed refresh.
 *
 * Vercel Cron calls this with an Authorization: Bearer <CRON_SECRET> header.
 * Without CRON_SECRET set the route refuses to run rather than defaulting to
 * open — an unauthenticated endpoint that fans out to 74 external APIs is a
 * free denial-of-wallet lever for anyone who finds the URL.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured; scheduled refresh is disabled.' },
      { status: 503 }
    )
  }

  const provided = request.headers.get('authorization')
  if (provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const results = await refreshJobFeed()

  const summary = {
    boards: results.length,
    scanned: results.reduce((sum, r) => sum + r.scanned, 0),
    relevant: results.reduce((sum, r) => sum + r.relevant, 0),
    added: results.reduce((sum, r) => sum + r.added, 0),
    failed: results.filter((r) => r.error).map((r) => ({ company: r.company, error: r.error })),
    durationMs: Date.now() - startedAt,
  }

  console.log('[cron] job feed refresh', JSON.stringify(summary))
  return NextResponse.json(summary)
}

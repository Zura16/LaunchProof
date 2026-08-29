import { prisma } from '@/lib/db/prisma'
import type { AiOperation } from '@prisma/client'

export class RateLimitError extends Error {
  constructor(
    message: string,
    readonly retryAt: Date
  ) {
    super(message)
  }
}

const WINDOW_MS = 24 * 60 * 60 * 1000

function limitFrom(envVar: string, fallback: number): number {
  const raw = process.env[envVar]
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

/**
 * Per-user daily caps on AI-backed operations.
 *
 * Every one of these spends money on the deployment's OpenAI key, so without
 * a cap a single user in a retry loop — or simply an enthusiastic one — can
 * run up real cost. Defaults are generous enough that ordinary use never
 * notices, and each is overridable per deployment.
 */
const LIMITS: Record<AiOperation, { perDay: number; label: string }> = {
  JOB_ANALYSIS: { perDay: limitFrom('AI_LIMIT_JOB_ANALYSIS', 30), label: 'job analyses' },
  RESUME_ANALYSIS: { perDay: limitFrom('AI_LIMIT_RESUME_ANALYSIS', 10), label: 'résumé analyses' },
  PROJECT_PLAN: { perDay: limitFrom('AI_LIMIT_PROJECT_PLAN', 15), label: 'project plans' },
}

function formatRetry(retryAt: Date): string {
  const hours = Math.ceil((retryAt.getTime() - Date.now()) / 3_600_000)
  if (hours <= 1) return 'in about an hour'
  if (hours < 24) return `in about ${hours} hours`
  return 'tomorrow'
}

export interface UsageStatus {
  used: number
  limit: number
  remaining: number
}

export async function getUsage(userId: string, operation: AiOperation): Promise<UsageStatus> {
  const since = new Date(Date.now() - WINDOW_MS)
  const used = await prisma.aiUsageEvent.count({
    where: { userId, operation, createdAt: { gte: since } },
  })
  const limit = LIMITS[operation].perDay
  return { used, limit, remaining: Math.max(0, limit - used) }
}

/**
 * Reserve one unit of quota, throwing if the user is out.
 *
 * The unit is recorded *before* the AI call rather than after, so concurrent
 * requests cannot slip past the check together. Callers refund it when the
 * call fails for reasons that are not the user's fault.
 */
export async function consumeAiQuota(userId: string, operation: AiOperation): Promise<string> {
  const { perDay, label } = LIMITS[operation]

  if (perDay === 0) {
    throw new RateLimitError(`${label} are disabled on this deployment.`, new Date(Date.now() + WINDOW_MS))
  }

  const since = new Date(Date.now() - WINDOW_MS)
  const used = await prisma.aiUsageEvent.count({
    where: { userId, operation, createdAt: { gte: since } },
  })

  if (used >= perDay) {
    const oldest = await prisma.aiUsageEvent.findFirst({
      where: { userId, operation, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    })
    const retryAt = new Date((oldest?.createdAt.getTime() ?? Date.now()) + WINDOW_MS)
    throw new RateLimitError(
      `You've used all ${perDay} ${label} for today. This resets ${formatRetry(retryAt)}.`,
      retryAt
    )
  }

  const event = await prisma.aiUsageEvent.create({ data: { userId, operation } })

  // Opportunistic pruning: keeps the table from growing without bound without
  // needing a separate scheduled job.
  if (Math.random() < 0.02) {
    await prisma.aiUsageEvent
      .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 2 * WINDOW_MS) } } })
      .catch(() => undefined)
  }

  return event.id
}

/** Return a reserved unit when the call failed for reasons outside the user's control. */
export async function refundAiQuota(eventId: string): Promise<void> {
  await prisma.aiUsageEvent.delete({ where: { id: eventId } }).catch(() => undefined)
}

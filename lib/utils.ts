import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a calendar date the user picked (application date, interview date).
 *
 * These are stored as UTC midnight, so formatting them in local time shows
 * the previous day anywhere west of UTC — a date entered as Aug 15 would
 * read "Aug 14" in US timezones. Always render them in UTC so the date the
 * user typed is the date they see back.
 *
 * Use this only for date-only values; true timestamps should render in the
 * viewer's local time.
 */
export function formatDateOnly(date: Date | null | undefined, fallback = '—'): string {
  if (!date) return fallback
  return date.toLocaleDateString(undefined, { timeZone: 'UTC' })
}

/** Convert a stored date-only value into a `<input type="date">` value. */
export function toDateInputValue(date: Date | null | undefined): string {
  return date ? date.toISOString().slice(0, 10) : ''
}

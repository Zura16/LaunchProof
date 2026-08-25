import * as React from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
}

// Lightweight CSS-only tooltip (no JS positioning) — sufficient for the
// short, static explanatory labels used across the app.
function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <span className={cn('group relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-max max-w-xs -translate-x-1/2 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
      >
        {content}
      </span>
    </span>
  )
}

export { Tooltip }

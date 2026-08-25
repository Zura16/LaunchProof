import * as React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 px-6 py-12 text-center',
        className
      )}
    >
      {icon && <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">{icon}</div>}
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="mx-auto max-w-sm text-xs text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}

export { EmptyState }

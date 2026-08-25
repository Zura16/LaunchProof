import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, indicatorClassName, ...props }, ref) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100))
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn('h-1.5 w-full overflow-hidden rounded-full bg-slate-100', className)}
        {...props}
      >
        <div
          className={cn('h-full rounded-full bg-slate-900 transition-all', indicatorClassName)}
          style={{ width: `${percent}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }

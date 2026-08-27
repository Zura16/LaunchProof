import { cn } from '@/lib/utils'

const STEPS = ['Student Info', 'Career Goals', 'Résumé', 'GitHub', 'Companies']

export function ProgressSteps({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex items-center justify-between gap-2">
      {STEPS.map((label, i) => {
        const step = i + 1
        const state = step === current ? 'current' : step < current ? 'done' : 'upcoming'
        return (
          <li key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold',
                state === 'done' && 'bg-slate-900 text-white',
                state === 'current' && 'border-2 border-slate-900 text-slate-900',
                state === 'upcoming' && 'border border-slate-300 text-slate-400'
              )}
            >
              {step}
            </div>
            <span
              className={cn(
                'hidden text-[11px] font-medium sm:block',
                state === 'upcoming' ? 'text-slate-400' : 'text-slate-700'
              )}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

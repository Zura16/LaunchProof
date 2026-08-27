'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Check, Search } from 'lucide-react'
import { saveTargetCompanies } from '@/app/onboarding/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Props {
  trackedCompanies: string[]
  initial: string[]
}

function SubmitButton({ count }: { count: number }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : count > 0 ? `Finish setup with ${count} compan${count === 1 ? 'y' : 'ies'}` : 'Finish setup'}
    </Button>
  )
}

export function StepCompanies({ trackedCompanies, initial }: Props) {
  const [state, formAction] = useFormState(saveTargetCompanies, undefined)
  const [selected, setSelected] = useState<string[]>(initial)
  const [query, setQuery] = useState('')
  const [custom, setCustom] = useState('')

  const toggle = (name: string) =>
    setSelected((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]))

  const visible = query
    ? trackedCompanies.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : trackedCompanies

  // Companies the student typed that aren't on the tracked list.
  const untracked = selected.filter((c) => !trackedCompanies.includes(c))

  const addCustom = () => {
    const name = custom.trim()
    if (name && !selected.includes(name)) setSelected((prev) => [...prev, name])
    setCustom('')
  }

  return (
    <form action={formAction} className="space-y-5">
      {selected.map((c) => (
        <input key={c} type="hidden" name="companies" value={c} />
      ))}

      <div className="space-y-2">
        <Label htmlFor="company-search">Companies LaunchProof tracks</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input
            id="company-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies…"
            className="pl-8"
          />
        </div>

        <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200 p-1">
          <div className="grid gap-1 sm:grid-cols-2">
            {visible.map((name) => {
              const isOn = selected.includes(name)
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggle(name)}
                  aria-pressed={isOn}
                  className={cn(
                    'flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
                    isOn ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <span className="truncate">{name}</span>
                  {isOn && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                </button>
              )
            })}
            {visible.length === 0 && (
              <p className="col-span-full px-2 py-3 text-xs text-slate-400">
                No tracked company matches “{query}”. Add it below and we&apos;ll still use it.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="custom-company">Somewhere else?</Label>
        <div className="flex gap-2">
          <Input
            id="custom-company"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustom()
              }
            }}
            placeholder="Any other company you're targeting"
          />
          <Button type="button" variant="outline" onClick={addCustom} disabled={!custom.trim()}>
            Add
          </Button>
        </div>
        {untracked.length > 0 && (
          <p className="text-[11px] text-slate-400">
            Added: {untracked.join(', ')} — we don&apos;t poll {untracked.length === 1 ? 'this' : 'these'} board yet, so
            you can still add roles there manually.
          </p>
        )}
      </div>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-400">
          {selected.length === 0
            ? 'You can skip this and browse everything in Discover.'
            : `${selected.length} selected`}
        </p>
        <SubmitButton count={selected.length} />
      </div>
    </form>
  )
}

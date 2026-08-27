'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Check, X } from 'lucide-react'
import { updateTargetCompaniesAction } from '@/app/(dashboard)/settings/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Props {
  trackedCompanies: string[]
  initial: string[]
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? 'Saving…' : 'Save companies'}
    </Button>
  )
}

export function TargetCompaniesForm({ trackedCompanies, initial }: Props) {
  const [state, formAction] = useFormState(updateTargetCompaniesAction, undefined)
  const [selected, setSelected] = useState<string[]>(initial)
  const [custom, setCustom] = useState('')

  const toggle = (name: string) =>
    setSelected((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]))

  const addCustom = () => {
    const name = custom.trim()
    if (name && !selected.includes(name)) setSelected((prev) => [...prev, name])
    setCustom('')
  }

  return (
    <form action={formAction} className="space-y-4">
      {selected.map((c) => (
        <input key={c} type="hidden" name="companies" value={c} />
      ))}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white"
              aria-label={`Remove ${c}`}
            >
              {c}
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 p-1">
        <div className="grid gap-1 sm:grid-cols-3">
          {trackedCompanies.map((name) => {
            const isOn = selected.includes(name)
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggle(name)}
                aria-pressed={isOn}
                className={cn(
                  'flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors',
                  isOn ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <span className="truncate">{name}</span>
                {isOn && <Check className="h-3 w-3 shrink-0" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addCustom()
            }
          }}
          placeholder="Add a company we don't track yet"
          aria-label="Add another company"
        />
        <Button type="button" variant="outline" onClick={addCustom} disabled={!custom.trim()}>
          Add
        </Button>
      </div>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </form>
  )
}

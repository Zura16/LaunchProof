'use client'

import { useState } from 'react'
import { deleteAccountAction } from '@/app/(dashboard)/settings/actions'
import { Button } from '@/components/ui/button'

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
        Delete account
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <p className="text-xs text-slate-600">This permanently deletes all your data. Are you sure?</p>
      <form action={deleteAccountAction}>
        <Button type="submit" variant="destructive" size="sm">
          Yes, delete everything
        </Button>
      </form>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  )
}

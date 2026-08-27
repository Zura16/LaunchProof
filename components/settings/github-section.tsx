'use client'

import { useFormStatus } from 'react-dom'
import { RefreshCw } from 'lucide-react'
import { syncGitHubAction, disconnectGitHubAction } from '@/app/(dashboard)/settings/actions'
import { Button } from '@/components/ui/button'

function SyncButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      <RefreshCw className={pending ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
      {pending ? 'Analyzing repositories…' : 'Sync repositories'}
    </Button>
  )
}

function DisconnectButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? 'Disconnecting…' : 'Disconnect'}
    </Button>
  )
}

export function GitHubActions() {
  return (
    <div className="flex items-center gap-2">
      <form action={syncGitHubAction}>
        <SyncButton />
      </form>
      <form action={disconnectGitHubAction}>
        <DisconnectButton />
      </form>
    </div>
  )
}

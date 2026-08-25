import Link from 'next/link'
import { Github, CheckCircle2 } from 'lucide-react'
import { signIn } from '@/lib/auth/auth'
import { Button } from '@/components/ui/button'

interface Props {
  connectedUsername: string | null
}

export function StepGitHub({ connectedUsername }: Props) {
  if (connectedUsername) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-slate-900">Connected as @{connectedUsername}</p>
            <p className="text-xs text-slate-500">Repository evidence analysis becomes available from Settings.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Link href="/onboarding?step=5">
            <Button>Continue</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Connecting GitHub lets LaunchProof detect real evidence — dependencies, tests, deployments — in your
        repositories instead of relying on what you say you know.
      </p>

      <form
        action={async () => {
          'use server'
          await signIn('github', { redirectTo: '/onboarding?step=4' })
        }}
      >
        <Button type="submit" variant="outline">
          <Github className="h-4 w-4" />
          Connect GitHub
        </Button>
      </form>

      <div className="flex justify-between pt-2">
        <Link href="/onboarding?step=5" className="text-xs font-medium text-slate-500 hover:text-slate-900">
          Skip for now
        </Link>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { Github, ArrowRight, Rocket } from 'lucide-react'
import { auth, signIn, GITHUB_ENABLED, GOOGLE_ENABLED } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { Button } from '@/components/ui/button'

export default async function LoginPage() {
  const session = await auth()
  if (session?.user?.id) {
    // Confirm the session's user still exists before redirecting into the
    // app. A JWT outlives the row it points to, and sending a stale session
    // to /onboarding would bounce straight back here.
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profile: { select: { onboardingCompletedAt: true } } },
    })
    if (user) {
      redirect(user.profile?.onboardingCompletedAt ? '/dashboard' : '/onboarding')
    }
  }

  const hasOAuth = GITHUB_ENABLED || GOOGLE_ENABLED

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Rocket className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Sign in to LaunchProof</h1>
          <p className="text-sm text-slate-500">Know exactly what to build next.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {hasOAuth && (
            <>
              <div className="space-y-3">
                {GITHUB_ENABLED && (
                  <form
                    action={async () => {
                      'use server'
                      await signIn('github', { redirectTo: '/onboarding' })
                    }}
                  >
                    <Button type="submit" variant="outline" className="w-full justify-center">
                      <Github className="h-4 w-4" aria-hidden="true" />
                      Continue with GitHub
                    </Button>
                  </form>
                )}

                {GOOGLE_ENABLED && (
                  <form
                    action={async () => {
                      'use server'
                      await signIn('google', { redirectTo: '/onboarding' })
                    }}
                  >
                    <Button type="submit" variant="outline" className="w-full justify-center">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </form>
                )}
              </div>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-400">OR</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </>
          )}

          <form
            action={async () => {
              'use server'
              await signIn('demo', { redirectTo: '/dashboard' })
            }}
          >
            <Button type="submit" variant={hasOAuth ? 'secondary' : 'default'} className="w-full justify-center">
              Explore the demo account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
          <p className="mt-2 text-center text-xs text-slate-400">
            Loads a fully seeded student profile — Alex Chen, CS senior — with no sign-up required.
          </p>
        </div>
      </div>
    </div>
  )
}

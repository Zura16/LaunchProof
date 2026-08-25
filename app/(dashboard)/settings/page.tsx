import { Github } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProfileForm } from '@/components/settings/profile-form'
import { DeleteAccountButton } from '@/components/settings/delete-account-button'
import { disconnectGitHubAction } from '@/app/(dashboard)/settings/actions'

export default async function SettingsPage() {
  const user = await requireUser()

  const [profile, githubAccount] = await Promise.all([
    prisma.studentProfile.findUniqueOrThrow({ where: { userId: user.id } }),
    prisma.gitHubAccount.findUnique({ where: { userId: user.id } }),
  ])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initial={{
              fullName: profile.fullName,
              university: profile.university,
              degree: profile.degree,
              major: profile.major,
              graduationDate: profile.graduationDate.toISOString().slice(0, 10),
              academicYear: profile.academicYear,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-slate-500" />
            {githubAccount ? (
              <span className="text-sm text-slate-700">
                Connected as <span className="font-medium">@{githubAccount.username}</span>
              </span>
            ) : (
              <span className="text-sm text-slate-500">Not connected</span>
            )}
          </div>
          {githubAccount ? (
            <form action={disconnectGitHubAction}>
              <Button type="submit" size="sm" variant="outline">
                Disconnect
              </Button>
            </form>
          ) : (
            <Badge variant="outline">Connect from onboarding</Badge>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
          <CardDescription>Permanently delete your account and all associated data.</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </div>
  )
}

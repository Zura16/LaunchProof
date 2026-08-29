import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Configuration diagnostics for a deployed instance.
 *
 * Auth.js reports every provider misconfiguration as the same opaque
 * "There is a problem with the server configuration", which is impossible to
 * act on from outside. This reports what is actually wrong.
 *
 * Guarded by CRON_SECRET — it reveals which secrets are present and whether
 * they are valid, which is exactly what an attacker would like to know. It
 * never returns a secret's value.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not set; diagnostics disabled.' }, { status: 503 })
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const present = (v?: string) => (v && v.trim().length > 0 ? 'set' : 'MISSING')
  const shape = (v?: string) =>
    v ? { length: v.length, trimmedLength: v.trim().length, hasWhitespace: /\s/.test(v) } : null

  const env = {
    DATABASE_URL: present(process.env.DATABASE_URL),
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? 'MISSING',
    NEXTAUTH_SECRET: present(process.env.NEXTAUTH_SECRET),
    AUTH_SECRET: present(process.env.AUTH_SECRET),
    OPENAI_API_KEY: present(process.env.OPENAI_API_KEY),
    BLOB_READ_WRITE_TOKEN: present(process.env.BLOB_READ_WRITE_TOKEN),
    CRON_SECRET: present(process.env.CRON_SECRET),
    GITHUB_CLIENT_ID: present(process.env.GITHUB_CLIENT_ID),
    GITHUB_CLIENT_SECRET: present(process.env.GITHUB_CLIENT_SECRET),
    githubClientIdValue: process.env.GITHUB_CLIENT_ID ?? null,
    githubClientIdShape: shape(process.env.GITHUB_CLIENT_ID),
    githubClientSecretShape: shape(process.env.GITHUB_CLIENT_SECRET),
  }

  // Ask GitHub whether this id/secret pair is even valid. Exchanging a
  // deliberately invalid code distinguishes the two failure modes:
  //   incorrect_client_credentials -> the pair is wrong
  //   bad_verification_code        -> the pair is fine; only the code was bad
  let githubCredentialCheck: unknown = 'skipped (id or secret missing)'
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    try {
      const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: 'launchproof-diagnostic-invalid-code',
        }),
        cache: 'no-store',
      })
      const body = (await res.json()) as { error?: string; error_description?: string }
      githubCredentialCheck = {
        githubError: body.error ?? null,
        verdict:
          body.error === 'bad_verification_code'
            ? 'CREDENTIALS VALID — the id and secret match; the failure is elsewhere'
            : body.error === 'incorrect_client_credentials'
              ? 'CREDENTIALS INVALID — GITHUB_CLIENT_SECRET does not belong to GITHUB_CLIENT_ID'
              : `unexpected: ${body.error ?? 'none'} ${body.error_description ?? ''}`,
      }
    } catch (e) {
      githubCredentialCheck = { error: e instanceof Error ? e.message : 'request failed' }
    }
  }

  return NextResponse.json({ env, githubCredentialCheck }, { status: 200 })
}

import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import { authConfig } from "@/lib/auth/auth.config"

export const DEMO_ACCOUNT_EMAIL = "alex.chen@example.edu"

/**
 * An OAuth provider is only usable if both halves of its credential are
 * present. Registering one without them still renders a sign-in button, but
 * the handshake fails at the provider with an opaque error — Google returns
 * "Error 400: invalid_request" — which looks like a broken app rather than
 * missing configuration. So providers are registered conditionally and the
 * sign-in page offers only what can actually work.
 */
function isConfigured(id?: string, secret?: string): boolean {
  const usable = (v?: string) => !!v && v.trim().length > 0 && !/^(dummy|your-|xxx|placeholder)/i.test(v)
  return usable(id) && usable(secret)
}

export const GITHUB_ENABLED = isConfigured(process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET)
export const GOOGLE_ENABLED = isConfigured(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  // Auth.js only auto-trusts the request host in development. Without this,
  // every auth route returns 500 ("UntrustedHost") in a production build —
  // the app is deployed behind its own proxy and the canonical origin is
  // pinned by NEXTAUTH_URL/AUTH_URL, so the forwarded host is trustworthy.
  // Can be overridden per-deployment with AUTH_TRUST_HOST.
  trustHost: true,
  // Auth.js collapses most failures into a generic "Configuration" message
  // for the user. Log the underlying cause so the deployment's runtime logs
  // say what actually went wrong.
  logger: {
    error(error) {
      console.error('[auth][error]', error?.name, error?.message, (error as { cause?: unknown })?.cause ?? '')
    },
  },
  providers: [
    ...(GITHUB_ENABLED
      ? [
          GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: {
              params: {
                // Least privilege: LaunchProof only ever reads public repository
                // metadata, and public repos are readable without any repo scope.
                // `public_repo` was removed deliberately — it grants *write* access
                // to every public repository, which this app never needs and which
                // is a lot to ask a student to approve just to have code inspected.
                scope: "read:user user:email",
              },
            },
          }),
        ]
      : []),
    ...(GOOGLE_ENABLED
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    // Lets anyone explore the fully seeded Alex Chen demo account without
    // OAuth credentials. Intentionally locked to one fixed, pre-seeded
    // account rather than accepting an arbitrary email — this is NOT a
    // general passwordless login.
    Credentials({
      id: "demo",
      name: "Demo Account",
      credentials: {},
      async authorize() {
        const user = await prisma.user.findUnique({
          where: { email: DEMO_ACCOUNT_EMAIL },
        })
        return user ?? null
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
})

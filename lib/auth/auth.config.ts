import type { NextAuthConfig } from 'next-auth'

// Edge-safe auth config: no Prisma adapter, no Node-only providers.
// Used by middleware (edge runtime) and spread into the full config in auth.ts.
export const PROTECTED_PATH_PREFIXES = [
  '/dashboard',
  '/jobs',
  '/market-insights',
  '/evidence',
  '/recommendations',
  '/projects',
  '/applications',
  '/resume',
  '/settings',
  '/onboarding',
]

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isProtected = PROTECTED_PATH_PREFIXES.some((prefix) =>
        request.nextUrl.pathname.startsWith(prefix)
      )
      if (!isProtected) return true
      return !!auth?.user
    },
  },
} satisfies NextAuthConfig

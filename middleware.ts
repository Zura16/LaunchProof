import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/auth.config'

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/discover/:path*',
    '/jobs/:path*',
    '/market-insights/:path*',
    '/evidence/:path*',
    '/recommendations/:path*',
    '/projects/:path*',
    '/applications/:path*',
    '/resume/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
  ],
}

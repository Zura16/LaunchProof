'use client'

import { useEffect } from 'react'

// Last-resort boundary: catches failures in the root layout itself, so it
// must render its own <html> and <body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Root error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', color: '#0f172a' }}>
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div style={{ maxWidth: '24rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>LaunchProof failed to load</h1>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.5rem' }}>
              An unexpected error stopped the app from starting. Your data has not been changed.
            </p>
            {error.digest && (
              <p style={{ fontSize: '0.6875rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                Reference: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                marginTop: '1.25rem',
                background: '#0f172a',
                color: '#fff',
                border: 0,
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

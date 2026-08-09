'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Client-only dynamic loader for R3F Hero3DScene to prevent Node.js SSR static evaluation
const Hero3DSceneInner = dynamic(
  () => import('./hero-3d-scene').then((mod) => mod.Hero3DScene),
  { ssr: false }
)

export function Hero3DSceneWrapper() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-72 w-full max-w-lg mx-auto flex items-center justify-center">
        <div className="h-48 w-48 rounded-full border border-blue-500/20 bg-blue-500/5 animate-pulse-subtle" />
      </div>
    )
  }

  return <Hero3DSceneInner />
}

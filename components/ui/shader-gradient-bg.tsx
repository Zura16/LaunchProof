'use client'

import { WireframeNetBg } from './wireframe-net-bg'

interface ShaderGradientBgProps {
  className?: string
  opacity?: number
}

export function ShaderGradientBg({
  className = 'fixed inset-0 -z-10 overflow-hidden pointer-events-none',
  opacity = 0.3,
}: ShaderGradientBgProps) {
  return <WireframeNetBg className={className} opacity={opacity} />
}

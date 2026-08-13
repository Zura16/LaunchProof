'use client'

import React from 'react'

export function ReadinessRadar() {
  // Dimensions and scores (0 - 100)
  const dimensions = [
    { label: 'Backend APIs', score: 85 },
    { label: 'Databases', score: 80 },
    { label: 'Cloud & DevOps', score: 65 },
    { label: 'Frontend & TS', score: 90 },
    { label: 'System Design', score: 70 },
  ]

  const total = dimensions.length
  const radius = 90
  const center = 120

  // Helper to get coordinates
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2
    const r = (value / 100) * radius
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y }
  }

  // Generate polygon points for candidate score
  const scorePoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.score)
      return `${x},${y}`
    })
    .join(' ')

  // Generate polygon points for 100% outer boundary
  const gridPoints100 = dimensions
    .map((_, i) => {
      const { x, y } = getCoordinates(i, 100)
      return `${x},${y}`
    })
    .join(' ')

  const gridPoints50 = dimensions
    .map((_, i) => {
      const { x, y } = getCoordinates(i, 50)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100/80 pb-3">
        <div>
          <h3 className="text-sm font-black text-slate-900">Skill Readiness Radar</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            5-axis evidence readiness comparison vs top market demands.
          </p>
        </div>
        <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
          Live Radar
        </span>
      </div>

      <div className="flex flex-col items-center justify-center">
        <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible">
          {/* Outer Grid 100% */}
          <polygon points={gridPoints100} fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
          {/* Mid Grid 50% */}
          <polygon points={gridPoints50} fill="none" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />

          {/* Axes */}
          {dimensions.map((d, i) => {
            const outer = getCoordinates(i, 100)
            const labelPos = getCoordinates(i, 118)
            return (
              <g key={i}>
                <line x1={center} y1={center} x2={outer.x} y2={outer.y} stroke="#cbd5e1" strokeWidth="1" />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-700 text-[10px] font-black tracking-tight"
                >
                  {d.label} ({d.score}%)
                </text>
              </g>
            )
          })}

          {/* Candidate Filled Radar Area */}
          <polygon
            points={scorePoints}
            fill="rgba(15, 23, 42, 0.15)"
            stroke="#0f172a"
            strokeWidth="2.5"
            className="transition-all duration-500"
          />

          {/* Radar Points */}
          {dimensions.map((d, i) => {
            const { x, y } = getCoordinates(i, d.score)
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#0f172a"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="shadow-sm"
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}

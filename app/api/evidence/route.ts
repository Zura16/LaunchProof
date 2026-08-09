import { NextResponse } from 'next/server'
import { computeEvidenceGraph } from '@/lib/services/evidence-graph.service'

export async function GET() {
  const targetSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Redis', 'CI/CD', 'REST APIs', 'Git']
  const graph = computeEvidenceGraph(targetSkills)

  return NextResponse.json({
    success: true,
    evidenceGraph: graph,
  })
}

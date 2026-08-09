import { NextResponse } from 'next/server'
import { generateProjectPlan } from '@/lib/services/project-generator.service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { gaps, targetRepoName } = body

    const plan = generateProjectPlan(gaps || ['Docker', 'Redis', 'CI/CD'], targetRepoName)

    return NextResponse.json({
      success: true,
      plan,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to generate project plan' }, { status: 500 })
  }
}

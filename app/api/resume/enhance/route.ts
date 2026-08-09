import { NextResponse } from 'next/server'
import { enhanceResumeBullets } from '@/lib/services/resume-enhancer.service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bulletText, skills } = body

    const enhancements = enhanceResumeBullets(bulletText || '', skills || ['React', 'TypeScript', 'Node.js'])

    return NextResponse.json({
      success: true,
      enhancements,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to enhance resume' }, { status: 500 })
  }
}

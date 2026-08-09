import { NextResponse } from 'next/server'
import { parseJobDescription } from '@/lib/services/job-parser.service'
import { ALEX_CHEN_SEED } from '@/lib/services/seed-data.service'

export async function GET() {
  return NextResponse.json({
    success: true,
    jobs: ALEX_CHEN_SEED.savedJobs,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, description, company, title } = body

    if (!description && !url) {
      return NextResponse.json({ error: 'Job URL or description is required' }, { status: 400 })
    }

    const parsed = parseJobDescription(description || '', url, company, title)

    const newJob = {
      id: `job-${Date.now()}`,
      company: parsed.company,
      title: parsed.title,
      location: parsed.location,
      url: parsed.url,
      dateSaved: 'Just Now',
      eligibility: parsed.eligibility,
      requirements: parsed.requirements,
      fitReasoning: parsed.fitReasoning,
    }

    return NextResponse.json({
      success: true,
      parsedJob: newJob,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to parse job' }, { status: 500 })
  }
}

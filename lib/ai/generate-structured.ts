import type { ZodSchema } from 'zod'
import { getOpenAIClient, isAIConfigured } from '@/lib/ai/client'
import { SAFETY_DIRECTIVES } from '@/lib/ai/safety-directives'

export class AIAnalysisError extends Error {}

interface GenerateStructuredOptions<T> {
  system: string
  user: string
  schema: ZodSchema<T>
  model?: string
}

// Every structured AI call in the app goes through here: one retry on a
// malformed/invalid response, then a typed, recoverable error — never an
// unvalidated JSON blob handed back to the caller.
export async function generateStructured<T>({ system, user, schema, model }: GenerateStructuredOptions<T>): Promise<T> {
  if (!isAIConfigured()) {
    throw new AIAnalysisError(
      'AI analysis is not configured. Set a real OPENAI_API_KEY in your environment to enable this feature.'
    )
  }

  const client = getOpenAIClient()
  const fullSystem = `${system}\n\n${SAFETY_DIRECTIVES}`

  let lastError: unknown
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: model ?? 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: fullSystem },
          { role: 'user', content: user },
        ],
      })

      const raw = completion.choices[0]?.message?.content
      if (!raw) throw new Error('Empty response from model')

      const parsed = JSON.parse(raw)
      return schema.parse(parsed)
    } catch (e) {
      lastError = e
    }
  }

  const reason = lastError instanceof Error ? lastError.message : 'Unknown error'
  throw new AIAnalysisError(`AI analysis failed after retrying: ${reason}`)
}

import OpenAI from 'openai'

// A key that's obviously a local placeholder rather than a real secret —
// lets us fail fast with a clear message instead of a cryptic 401 from
// OpenAI when someone hasn't configured a real key yet.
const PLACEHOLDER_KEY_PATTERNS = ['dummy', 'replace-in-production', 'your-api-key', 'sk-xxxx']

export function isAIConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY
  if (!key) return false
  return !PLACEHOLDER_KEY_PATTERNS.some((p) => key.toLowerCase().includes(p))
}

let client: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return client
}

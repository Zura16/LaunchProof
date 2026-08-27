import type { AtsProvider } from '@prisma/client'

export interface SeedJobSource {
  companyName: string
  provider: AtsProvider
  boardToken: string
}

/**
 * Company job boards LaunchProof polls.
 *
 * Every token here was verified to return postings from its provider's
 * public API. Companies migrate between ATS vendors, so a board that starts
 * failing is recorded on the JobSource row (lastError) and surfaced in the
 * UI rather than silently disappearing.
 *
 * To add a company: find its board token from its careers URL —
 *   Greenhouse  boards.greenhouse.io/<token>  or  job-boards.greenhouse.io/<token>
 *   Ashby       jobs.ashbyhq.com/<token>
 * — confirm the API returns jobs, then add a row below.
 */
export const JOB_SOURCES: SeedJobSource[] = [
  // --- Greenhouse ---
  { companyName: 'Stripe', provider: 'GREENHOUSE', boardToken: 'stripe' },
  { companyName: 'Airbnb', provider: 'GREENHOUSE', boardToken: 'airbnb' },
  { companyName: 'Databricks', provider: 'GREENHOUSE', boardToken: 'databricks' },
  { companyName: 'Robinhood', provider: 'GREENHOUSE', boardToken: 'robinhood' },
  { companyName: 'Instacart', provider: 'GREENHOUSE', boardToken: 'instacart' },
  { companyName: 'Affirm', provider: 'GREENHOUSE', boardToken: 'affirm' },
  { companyName: 'Dropbox', provider: 'GREENHOUSE', boardToken: 'dropbox' },
  { companyName: 'Reddit', provider: 'GREENHOUSE', boardToken: 'reddit' },
  { companyName: 'Twilio', provider: 'GREENHOUSE', boardToken: 'twilio' },
  { companyName: 'Cloudflare', provider: 'GREENHOUSE', boardToken: 'cloudflare' },
  { companyName: 'GitLab', provider: 'GREENHOUSE', boardToken: 'gitlab' },
  { companyName: 'Asana', provider: 'GREENHOUSE', boardToken: 'asana' },
  { companyName: 'Lyft', provider: 'GREENHOUSE', boardToken: 'lyft' },
  { companyName: 'Pinterest', provider: 'GREENHOUSE', boardToken: 'pinterest' },
  { companyName: 'Figma', provider: 'GREENHOUSE', boardToken: 'figma' },
  { companyName: 'Anthropic', provider: 'GREENHOUSE', boardToken: 'anthropic' },
  { companyName: 'Coinbase', provider: 'GREENHOUSE', boardToken: 'coinbase' },
  { companyName: 'Brex', provider: 'GREENHOUSE', boardToken: 'brex' },
  { companyName: 'Scale AI', provider: 'GREENHOUSE', boardToken: 'scaleai' },
  { companyName: 'Discord', provider: 'GREENHOUSE', boardToken: 'discord' },
  { companyName: 'Datadog', provider: 'GREENHOUSE', boardToken: 'datadog' },
  { companyName: 'MongoDB', provider: 'GREENHOUSE', boardToken: 'mongodb' },
  { companyName: 'Elastic', provider: 'GREENHOUSE', boardToken: 'elastic' },
  { companyName: 'Okta', provider: 'GREENHOUSE', boardToken: 'okta' },
  { companyName: 'Zscaler', provider: 'GREENHOUSE', boardToken: 'zscaler' },
  { companyName: 'Toast', provider: 'GREENHOUSE', boardToken: 'toast' },
  { companyName: 'Verkada', provider: 'GREENHOUSE', boardToken: 'verkada' },
  { companyName: 'Samsara', provider: 'GREENHOUSE', boardToken: 'samsara' },
  { companyName: 'Roblox', provider: 'GREENHOUSE', boardToken: 'roblox' },
  { companyName: 'Flexport', provider: 'GREENHOUSE', boardToken: 'flexport' },
  { companyName: 'Klaviyo', provider: 'GREENHOUSE', boardToken: 'klaviyo' },
  { companyName: 'Nuro', provider: 'GREENHOUSE', boardToken: 'nuro' },
  { companyName: 'Upstart', provider: 'GREENHOUSE', boardToken: 'upstart' },
  { companyName: 'Vercel', provider: 'GREENHOUSE', boardToken: 'vercel' },
  { companyName: 'Duolingo', provider: 'GREENHOUSE', boardToken: 'duolingo' },
  { companyName: 'Gusto', provider: 'GREENHOUSE', boardToken: 'gusto' },
  { companyName: 'Postman', provider: 'GREENHOUSE', boardToken: 'postman' },
  { companyName: 'Chime', provider: 'GREENHOUSE', boardToken: 'chime' },
  { companyName: 'Twitch', provider: 'GREENHOUSE', boardToken: 'twitch' },
  { companyName: 'SoFi', provider: 'GREENHOUSE', boardToken: 'sofi' },
  { companyName: 'Carta', provider: 'GREENHOUSE', boardToken: 'carta' },
  { companyName: 'Faire', provider: 'GREENHOUSE', boardToken: 'faire' },
  { companyName: 'Mercury', provider: 'GREENHOUSE', boardToken: 'mercury' },
  { companyName: 'New Relic', provider: 'GREENHOUSE', boardToken: 'newrelic' },
  { companyName: 'PagerDuty', provider: 'GREENHOUSE', boardToken: 'pagerduty' },
  { companyName: 'Peloton', provider: 'GREENHOUSE', boardToken: 'peloton' },
  { companyName: 'Fastly', provider: 'GREENHOUSE', boardToken: 'fastly' },
  { companyName: 'Amplitude', provider: 'GREENHOUSE', boardToken: 'amplitude' },
  { companyName: 'Betterment', provider: 'GREENHOUSE', boardToken: 'betterment' },
  { companyName: 'Gemini', provider: 'GREENHOUSE', boardToken: 'gemini' },
  { companyName: 'Squarespace', provider: 'GREENHOUSE', boardToken: 'squarespace' },
  { companyName: 'Webflow', provider: 'GREENHOUSE', boardToken: 'webflow' },
  { companyName: 'Wise', provider: 'GREENHOUSE', boardToken: 'wise' },
  { companyName: 'Airtable', provider: 'GREENHOUSE', boardToken: 'airtable' },
  { companyName: 'Calendly', provider: 'GREENHOUSE', boardToken: 'calendly' },
  { companyName: 'Lattice', provider: 'GREENHOUSE', boardToken: 'lattice' },
  { companyName: 'CircleCI', provider: 'GREENHOUSE', boardToken: 'circleci' },
  { companyName: 'Doximity', provider: 'GREENHOUSE', boardToken: 'doximity' },
  { companyName: 'EarnIn', provider: 'GREENHOUSE', boardToken: 'earnin' },

  // --- Ashby ---
  { companyName: 'OpenAI', provider: 'ASHBY', boardToken: 'openai' },
  { companyName: 'Ramp', provider: 'ASHBY', boardToken: 'ramp' },
  { companyName: 'Linear', provider: 'ASHBY', boardToken: 'linear' },
  { companyName: 'Vanta', provider: 'ASHBY', boardToken: 'vanta' },
  { companyName: 'Notion', provider: 'ASHBY', boardToken: 'notion' },
  { companyName: 'ClickHouse', provider: 'ASHBY', boardToken: 'clickhouse' },
  { companyName: 'Replit', provider: 'ASHBY', boardToken: 'replit' },
  { companyName: 'Cursor', provider: 'ASHBY', boardToken: 'cursor' },
  { companyName: 'Perplexity', provider: 'ASHBY', boardToken: 'perplexity' },
  { companyName: 'ElevenLabs', provider: 'ASHBY', boardToken: 'elevenlabs' },
  { companyName: 'Sierra', provider: 'ASHBY', boardToken: 'sierra' },
  { companyName: 'Suno', provider: 'ASHBY', boardToken: 'suno' },
  { companyName: 'Runway', provider: 'ASHBY', boardToken: 'runway' },
  { companyName: 'Abridge', provider: 'ASHBY', boardToken: 'abridge' },
  { companyName: 'Watershed', provider: 'ASHBY', boardToken: 'watershed' },
]

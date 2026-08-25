import { MarketingNavbar } from '@/components/marketing/navbar'
import { Hero } from '@/components/marketing/hero'
import { ProblemSection } from '@/components/marketing/problem-section'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { ExampleInsight } from '@/components/marketing/example-insight'
import { FinalCta } from '@/components/marketing/final-cta'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingNavbar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <ExampleInsight />
      <FinalCta />
    </div>
  )
}

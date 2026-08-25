const STEPS = [
  {
    step: '1',
    title: 'Save target jobs',
    description: 'Paste in the postings you actually want. LaunchProof extracts required, preferred, and eligibility skills from each one.',
  },
  {
    step: '2',
    title: 'Connect your evidence',
    description: 'Upload your résumé and connect GitHub. LaunchProof looks for real evidence — dependencies, tests, deployments — not just claims.',
  },
  {
    step: '3',
    title: 'Get a prioritized improvement plan',
    description: 'See exactly which gaps matter most across your target market, and turn the highest-impact one into a project plan.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-slate-200 bg-white py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">How it works</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {s.step}
              </span>
              <h3 className="text-sm font-semibold text-slate-900">{s.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

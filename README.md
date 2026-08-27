# LaunchProof

**Stop guessing what employers want.**

LaunchProof analyzes the jobs a student is targeting, compares them against what they've actually built, and tells them what to improve next.

It's built around one idea: a student shouldn't merely *have* a skill — they should have **evidence** for it. Every skill in LaunchProof is either proven by something checkable (a dependency in a manifest, a test suite, a CI workflow, a deployed URL) or it isn't, and the app is careful about the difference.

---

## What it does

```
Target Jobs → Requirements → Skills → Student Evidence → Gaps → Recommended Actions
```

1. **Save target jobs.** Paste in real postings. Requirement extraction pulls out skills and classifies each as required, preferred, a responsibility, or an eligibility criterion.
2. **Connect evidence.** Upload a résumé and connect GitHub. Repositories are inspected for dependencies, test directories, Dockerfiles, and CI config.
3. **See the gaps.** Skill demand across your saved jobs is compared against your evidence, ranked by how often it's asked for, how central it is, and how far you are from proving it.
4. **Get a plan.** The highest-impact gaps become a concrete project plan with checkable tasks.
5. **Track applications** through the pipeline.

### Design principles

These are enforced in code, not just aspirations:

- **No fabricated match scores.** No "87% match", no predicted hiring outcomes. Fit is expressed as Strong / Moderate / Weak / Self-reported / Missing / Unknown.
- **`Unknown` ≠ `Missing`.** If you haven't connected anything to inspect, LaunchProof says it doesn't know — claiming a skill is absent would be a fabrication.
- **Every classification is explainable.** Each one traces to a specific file path, manifest line, or résumé section.
- **Evidence strength reflects what was actually proven.** A dependency in `package.json` with no implementation files is `MODERATE`, not `STRONG`. A résumé claim is capped at `WEAK` because nothing on a résumé is verifiable.
- **Ranking is deterministic.** Market frequency, requirement importance, evidence gap, and action efficiency are application logic. AI is used for extraction and wording — never to decide what matters or in what order.

---

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript (strict) |
| Styling | Tailwind CSS, hand-rolled UI primitives |
| Database | PostgreSQL via Prisma |
| Auth | Auth.js (NextAuth v5) — GitHub, Google, plus a seeded demo account |
| AI | OpenAI behind a single server-side abstraction, all output Zod-validated |
| Integrations | Octokit (GitHub), pdf-parse (résumé text) |

---

## Getting started

### Prerequisites

- Node.js 18+
- A PostgreSQL database

### Setup

```bash
npm install
cp .env.example .env    # then fill in the values below
npm run db:push         # create the schema
npm run db:seed         # load the demo account
npm run dev
```

Open http://localhost:3000 and click **"Explore the demo account"** — no credentials needed.

### Environment

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/launchproof?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."           # openssl rand -base64 32

# Optional — the app runs without these
OPENAI_API_KEY="sk-..."         # job and résumé analysis
GITHUB_CLIENT_ID="..."          # GitHub sign-in and repository sync
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

**Everything degrades gracefully without the optional keys.** Without `OPENAI_API_KEY`, job and résumé analysis surface a clear "not configured" message instead of failing, and project plans fall back to deterministic templates. The seeded demo account is fully populated either way — its evidence, gaps, and recommendations are *derived by the real engines*, not hardcoded.

---

## The demo account

`npm run db:seed` creates Alex Chen, a CS student with 12 target jobs, 3 repositories, and a résumé. Nothing about the outcome is asserted — the seed runs the same analyzers a real user would, and independently produces:

- **Strong:** React, JavaScript, TypeScript, Node.js, REST APIs
- **Moderate:** SQL, PostgreSQL
- **Missing:** Automated Testing, AWS, Docker, CI/CD
- **Top recommendation:** *Upgrade CampusConnect* (HIGH impact), bundling four gaps into one piece of work

---

## Verification

```bash
npm run verify        # 57 offline checks, no API cost
npm run verify:ai     # live AI extraction (requires OPENAI_API_KEY)
npm run verify:e2e    # full pipeline: analyze → normalize → gaps → fit
```

The offline suite covers the logic the product's honesty claims depend on: that absence stays absence, that evidence rollups take the strongest source, that removing a résumé retracts only its own claims, that no skill is claimed by two recommendations, and that dismissed advice is never resurrected.

---

## Architecture

```
app/
  (marketing)         landing page
  (dashboard)/        authenticated app — one route per feature
  onboarding/         5-step setup
  login/
lib/
  ai/                 the only place OpenAI is called; Zod-validated, retried once
  services/           gap analysis, evidence sync, normalization, recommendations
  github/             repo fetching + snapshot types
  auth/               edge-safe config + full config + requireUser()
schemas/              Zod schemas for AI output and forms
prisma/               schema + seed
scripts/              runnable verification suites
```

A few decisions worth knowing about:

- **Repository analysis is deterministic, not AI.** A dependency, a test folder, a Dockerfile are checkable facts. `analyzeRepoSnapshot` is a pure function over a snapshot, so it runs identically against live GitHub, seed fixtures, and tests.
- **Gaps are derived, not stored authoritatively.** They're cheap to compute, so they're recomputed whenever their inputs change rather than left to drift.
- **`StudentSkill.highestStrength` is a rollup** rebuilt from evidence rows, so disconnecting a source correctly downgrades a skill instead of leaving a stale strength behind.
- **Skill normalization runs exact → alias → AI canonical guess → fuzzy**, creating a new canonical skill only as a last resort. Weak signals (repo topics) can attach to known skills but can never mint new ones.

---

## Deployment

This is a **server-rendered application** — 19 dynamic routes, 9 modules of server actions, middleware, and a database. It needs a Node runtime and a Postgres instance; it cannot run as a static site.

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the walkthrough.

---

## Scope

Deliberately **not** built: browser extension, auto-apply, job-board scraping. Jobs are pasted in by the user.

## Status

Live GitHub OAuth sync is implemented but has not been exercised against the real GitHub API. Résumé and job analysis have been verified against the live OpenAI API.

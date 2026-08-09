'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, Terminal, FileCode, ShieldCheck, Sparkles } from 'lucide-react'

export default function GitPatchPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(sectionId)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const gitCommands = `git checkout -b feature/docker-redis-upgrade
git add Dockerfile docker-compose.yml
git commit -m "feat(infra): add multi-stage Dockerfile and Redis orchestration"
git push origin feature/docker-redis-upgrade`

  const dockerfileSnippet = `# Multi-stage production build for LaunchProof backend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
EXPOSE 3000
CMD ["npm", "run", "start"]`

  const githubActionsSnippet = `name: LaunchProof Evidence CI Pipeline

on:
  push:
    branches: [ main, feature/* ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-language: '18'
      - run: npm ci
      - run: npm run test`

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="space-y-2 border-b border-slate-200/80 pb-6">
        <Link
          href="/projects/plan-1"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Project Plan</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Terminal className="h-6 w-6 text-slate-900" />
          <span>Git Patch & Evidence Code Generator</span>
        </h1>
        <p className="text-xs font-medium text-slate-500">
          Ready-to-copy code patches, Docker configuration, and GitHub Actions CI pipelines to verify your skill proof.
        </p>
      </div>

      {/* 1. Git Commit Terminal Script */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900">
            <Terminal className="h-4 w-4 text-slate-900" />
            <span>1. Git Commit Script</span>
          </div>
          <button
            onClick={() => handleCopy(gitCommands, 'git')}
            className="glass-btn-secondary py-1.5 px-3 text-xs"
          >
            {copiedSection === 'git' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-700" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>

        <pre className="rounded-xl bg-slate-900 p-4 text-xs font-mono text-emerald-400 overflow-x-auto shadow-inner">
          {gitCommands}
        </pre>
      </div>

      {/* 2. Dockerfile Code Template */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900">
            <FileCode className="h-4 w-4 text-slate-900" />
            <span>2. Multi-Stage Dockerfile (`Dockerfile`)</span>
          </div>
          <button
            onClick={() => handleCopy(dockerfileSnippet, 'docker')}
            className="glass-btn-secondary py-1.5 px-3 text-xs"
          >
            {copiedSection === 'docker' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-700" />
                <span>Copy Dockerfile</span>
              </>
            )}
          </button>
        </div>

        <pre className="rounded-xl bg-slate-900 p-4 text-xs font-mono text-cyan-300 overflow-x-auto shadow-inner">
          {dockerfileSnippet}
        </pre>
      </div>

      {/* 3. GitHub Actions CI Pipeline Code Template */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900">
            <ShieldCheck className="h-4 w-4 text-slate-900" />
            <span>3. GitHub Actions CI Workflow (`.github/workflows/ci.yml`)</span>
          </div>
          <button
            onClick={() => handleCopy(githubActionsSnippet, 'ci')}
            className="glass-btn-secondary py-1.5 px-3 text-xs"
          >
            {copiedSection === 'ci' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-700" />
                <span>Copy Workflow YAML</span>
              </>
            )}
          </button>
        </div>

        <pre className="rounded-xl bg-slate-900 p-4 text-xs font-mono text-purple-300 overflow-x-auto shadow-inner">
          {githubActionsSnippet}
        </pre>
      </div>
    </div>
  )
}

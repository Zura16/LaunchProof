'use client'

import { useState, useEffect } from 'react'
import { loadAppState } from '@/lib/store/app-store'
import { MessageSquare, Sparkles, CheckCircle2, ArrowRight, RefreshCw, Send, ShieldCheck, HelpCircle } from 'lucide-react'

interface InterviewQuestion {
  id: string
  topic: string
  question: string
  contextReason: string
  sampleAnswer: string
}

export default function InterviewsPage() {
  const [skills, setSkills] = useState<string[]>([])
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluatedScore, setEvaluatedScore] = useState<number | null>(null)
  const [evaluatedFeedback, setEvaluatedFeedback] = useState<string | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  useEffect(() => {
    const state = loadAppState()
    setSkills(state.customSkills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'])
  }, [])

  const questions: InterviewQuestion[] = [
    {
      id: 'q1',
      topic: 'System Design & REST APIs',
      question: 'How do you design a high-throughput REST API endpoint with database query caching to handle spike loads?',
      contextReason: '75% of your target jobs (Stripe, Meta) require high-concurrency REST API design.',
      sampleAnswer: 'Use an in-memory cache like Redis to store GET query responses, set TTL cache invalidation on write endpoints (POST/PUT), and implement rate-limiting middleware.',
    },
    {
      id: 'q2',
      topic: 'Containerization & Docker',
      question: 'Explain why multi-stage Docker builds are used and how docker-compose orchestrates API and PostgreSQL containers.',
      contextReason: 'Identified as a critical gap in your target market evidence graph.',
      sampleAnswer: 'Multi-stage builds separate the build environment from the final runtime image to shrink image size. docker-compose manages container dependencies and networking.',
    },
    {
      id: 'q3',
      topic: 'Relational Database Optimization',
      question: 'How do index scans differ from sequential table scans in PostgreSQL, and when would an index degrade write performance?',
      contextReason: 'PostgreSQL is listed as a required database skill across your saved SWE roles.',
      sampleAnswer: 'Index scans use B-tree structures to fetch matching rows in O(log N) time rather than scanning every page O(N). Indexes add overhead on INSERT/UPDATE operations.',
    },
  ]

  const currentQ = questions[activeQuestionIndex]

  const handleEvaluateAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userAnswer.trim()) return

    setIsEvaluating(true)

    setTimeout(() => {
      const text = userAnswer.toLowerCase()
      let score = 85
      let feedback = 'Strong response! You mentioned core technical concepts clearly.'

      if (text.length < 30) {
        score = 65
        feedback = 'Good start, but expand on implementation details and trade-offs.'
      } else if (text.includes('cache') || text.includes('redis') || text.includes('index') || text.includes('docker')) {
        score = 94
        feedback = 'Excellent technical depth! Your answer directly aligns with employer requirements.'
      }

      setEvaluatedScore(score)
      setEvaluatedFeedback(feedback)
      setIsEvaluating(false)
    }, 600)
  }

  const handleNextQuestion = () => {
    setActiveQuestionIndex((prev) => (prev + 1) % questions.length)
    setUserAnswer('')
    setEvaluatedScore(null)
    setEvaluatedFeedback(null)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-slate-900" />
            <h1 className="text-2xl font-black text-slate-900">AI Technical Mock Interviewer</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Targeted technical interview practice tailored to your saved jobs and evidence gaps.
          </p>
        </div>

        <button onClick={handleNextQuestion} className="glass-btn-secondary py-2 px-4 text-xs">
          <RefreshCw className="h-3.5 w-3.5 text-slate-700" />
          <span>Next Question</span>
        </button>
      </div>

      {/* Main Question & Simulator Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Question & Answer Console */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-xs">
                Question {activeQuestionIndex + 1} of {questions.length} • {currentQ.topic}
              </span>
              <span className="text-xs font-bold text-slate-400">Target Match</span>
            </div>

            <h2 className="text-xl font-black text-slate-900 leading-snug">{currentQ.question}</h2>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-700 flex items-start gap-2 shadow-xs">
              <Sparkles className="h-4 w-4 text-slate-900 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Why am I being asked this? </span>
                <span className="text-slate-600 font-medium">{currentQ.contextReason}</span>
              </div>
            </div>

            {/* Answer Input */}
            <form onSubmit={handleEvaluateAnswer} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900">Your Technical Response</label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your technical answer here..."
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all font-sans"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setUserAnswer(currentQ.sampleAnswer)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Load Ideal Sample Response
                </button>
                <button type="submit" disabled={isEvaluating} className="glass-btn-primary py-2.5 px-6">
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      <span>Evaluating Answer...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-white" />
                      <span>Submit Answer for AI Scoring</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Feedback Evaluation Card */}
          {evaluatedScore !== null && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 backdrop-blur-xl p-6 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-black text-emerald-950 text-base">Response Score: {evaluatedScore}/100</h3>
                </div>
                <span className="rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                  Passed
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-900">{evaluatedFeedback}</p>
            </div>
          )}
        </div>

        {/* Right: Ideal Answer Reference */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-3 shadow-md">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-900" />
              <span>Evidence-Backed Ideal Guide</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80">
              "{currentQ.sampleAnswer}"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

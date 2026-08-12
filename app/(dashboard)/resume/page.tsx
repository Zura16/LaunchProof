'use client'

import { useState, useEffect, useRef } from 'react'
import { loadAppState, saveAppState } from '@/lib/store/app-store'
import {
  extractTextFromPDFBuffer,
  extractSkillsFromText,
  extractBulletsFromText,
  ExtractedBulletResult,
} from '@/lib/services/resume-parser-engine'
import { FileText, Sparkles, CheckCircle2, ShieldCheck, Upload, Plus, X, RefreshCw, Download } from 'lucide-react'

export default function ResumePage() {
  const [resumeText, setResumeText] = useState<string>('')
  const [fileName, setFileName] = useState<string>('Uploaded_Resume.pdf')
  const [isParsing, setIsParsing] = useState<boolean>(false)
  const [extractedSkills, setExtractedSkills] = useState<string[]>([])
  const [extractedBullets, setExtractedBullets] = useState<ExtractedBulletResult[]>([])
  const [parseSuccess, setParseSuccess] = useState<boolean>(false)
  const [newSkillInput, setNewSkillInput] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const state = loadAppState()
    const currentSkills = state.customSkills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs']
    setExtractedSkills(currentSkills)
    setExtractedBullets(extractBulletsFromText('', currentSkills))
  }, [])

  // Handle PDF or TXT File Upload with Advanced Engine
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsParsing(true)
    setParseSuccess(false)

    if (file.name.endsWith('.pdf')) {
      const pdfReader = new FileReader()
      pdfReader.onload = (evt) => {
        const buffer = evt.target?.result as ArrayBuffer
        const text = extractTextFromPDFBuffer(buffer)
        processExtractedText(text, file.name)
      }
      pdfReader.readAsArrayBuffer(file)
    } else {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const text = (evt.target?.result as string) || ''
        processExtractedText(text, file.name)
      }
      reader.readAsText(file)
    }
  }

  // Process Extracted Text
  const processExtractedText = (text: string, name: string) => {
    setResumeText(text)
    setTimeout(() => {
      const skillsObj = extractSkillsFromText(text)
      const skillNames = skillsObj.map((s) => s.name)
      setExtractedSkills(skillNames)

      const bullets = extractBulletsFromText(text, skillNames)
      setExtractedBullets(bullets)

      // Save to global app state
      const state = loadAppState()
      saveAppState({ ...state, customSkills: skillNames })

      setIsParsing(false)
      setParseSuccess(true)
    }, 500)
  }

  // Add Custom Skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkillInput.trim()) return
    const skillToAdd = newSkillInput.trim()
    if (!extractedSkills.includes(skillToAdd)) {
      const updated = [...extractedSkills, skillToAdd]
      setExtractedSkills(updated)
      const state = loadAppState()
      saveAppState({ ...state, customSkills: updated })
    }
    setNewSkillInput('')
  }

  // Remove Skill
  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = extractedSkills.filter((s) => s !== skillToRemove)
    setExtractedSkills(updated)
    const state = loadAppState()
    saveAppState({ ...state, customSkills: updated })
  }

  // Export Enhanced Resume Download
  const handleExportResume = () => {
    const header = `EVIDENCE-ENHANCED STUDENT RÉSUMÉ\nVerified by LaunchProof Engine\n\nTECHNICAL SKILLS:\n${extractedSkills.join(', ')}\n\nSUGGESTED EVIDENCE-BACKED BULLET REVISONS:\n`
    const bulletsBody = extractedBullets
      .map((b, i) => `${i + 1}. ${b.suggested}\n   [Evidence Citation: ${b.evidenceBacking}]`)
      .join('\n\n')

    const fullContent = header + bulletsBody
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `LaunchProof_Enhanced_Resume.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-slate-900" />
            <h1 className="text-2xl font-black text-slate-900">Résumé Analysis & Skill Extractor</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Upload your PDF/TXT résumé or paste text below to extract skills and generate evidence-backed bullet improvements.
          </p>
        </div>

        <button onClick={handleExportResume} className="glass-btn-primary py-2.5 px-4 text-xs">
          <Download className="h-4 w-4 text-white" />
          <span>Download Enhanced Résumé</span>
        </button>
      </div>

      {/* 1. Drag & Drop File Uploader & Direct Text Box */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Drag & Drop File Zone */}
        <div className="lg:col-span-6 rounded-2xl border-2 border-dashed border-slate-300 bg-white/90 backdrop-blur-xl p-8 text-center space-y-4 hover:border-slate-900 transition-all shadow-sm">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
          />

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900/90 text-white shadow-lg shadow-slate-900/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
            <Upload className="h-6 w-6 text-white" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">Upload Your Résumé (PDF / TXT)</h3>
            <p className="text-xs text-slate-500 font-medium">Drag and drop your file here, or click to browse</p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="glass-btn-primary py-2.5 px-6"
          >
            <span>Select PDF or TXT File</span>
          </button>

          <p className="text-[11px] text-slate-400 font-medium pt-2">
            Supports .pdf, .txt, .doc • Intelligent client-side parser
          </p>
        </div>

        {/* Right: Direct Text Paste Box */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">Or Paste Résumé Text Directly</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">100% Accuracy</span>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your résumé bullet points, technical skills, or work experience here..."
            rows={5}
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all font-mono"
          />

          <button
            onClick={() => processExtractedText(resumeText || 'Built full-stack web application with React, TypeScript, Node.js, Express, PostgreSQL, and REST APIs.', 'Pasted_Resume.txt')}
            disabled={isParsing}
            className="glass-btn-primary w-full py-2.5"
          >
            {isParsing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Parsing & Extracting Skills...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-white" />
                <span>Parse & Extract Skills Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Parse Success Notification */}
      {parseSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 backdrop-blur-md p-4 flex items-center justify-between text-xs text-emerald-900 font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Successfully extracted {extractedSkills.length} skills from "{fileName}"! Updated your evidence graph.</span>
          </div>
        </div>
      )}

      {/* 2. Interactive Skills Editor & Extracted Skill Badges */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-4 shadow-md">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-100/80 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-900" />
              <span>Extracted Technical Skills ({extractedSkills.length})</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Click any skill to remove it, or add new skills manually below.</p>
          </div>

          {/* Add Custom Skill Form */}
          <form onSubmit={handleAddSkill} className="flex items-center gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              placeholder="Add missing skill (e.g. GraphQL)..."
              className="h-8 rounded-xl border border-slate-200/80 bg-slate-50 px-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none"
            />
            <button type="submit" className="glass-btn-primary h-8 py-0 px-3 text-xs">
              <Plus className="h-3.5 w-3.5 text-white" />
              <span>Add</span>
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {extractedSkills.map((skill) => (
            <span
              key={skill}
              className="group inline-flex items-center gap-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-xs"
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 3. Evidence-Backed Bullet Enhancer */}
      {extractedBullets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <Sparkles className="h-4 w-4 text-slate-900" />
            <span>Evidence-Backed Bullet Improvements for Your Résumé</span>
          </div>

          {extractedBullets.map((item, index) => (
            <div key={index} className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 space-y-3 shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Original Résumé Bullet:
                </span>
                <p className="text-xs font-mono text-slate-700 bg-slate-50/80 backdrop-blur-md p-3 rounded-xl border border-slate-200/80 font-medium">
                  "{item.original}"
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-900" />
                  Verified Evidence Source:
                </span>
                <p className="text-xs text-slate-900 font-black">{item.evidenceBacking}</p>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Evidence-Backed Suggested Revision:
                </span>
                <p className="text-xs text-emerald-950 bg-emerald-50/80 backdrop-blur-md p-3 rounded-xl border border-emerald-200 font-bold leading-relaxed shadow-xs">
                  "{item.suggested}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

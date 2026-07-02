import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Upload, FileText, Zap, CheckCircle, XCircle, AlertCircle,
  TrendingUp, Star, ArrowRight, Download, RefreshCw
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import toast from 'react-hot-toast'
import { resumeAPI } from '../services/api'

function ATSCircle({ score }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const r = 54, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-3xl font-bold text-white">{Math.round(score)}</div>
        <div className="text-gray-400 text-xs">ATS Score</div>
      </div>
    </div>
  )
}

function SectionScore({ section }) {
  const color = section.score >= 75 ? 'bg-green-500' : section.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium text-sm">{section.name}</span>
        <span className={`text-xs font-bold ${section.score >= 75 ? 'text-green-400' : section.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
          {section.score}/100
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2">
        <div className={`h-1.5 rounded-full ${color} transition-all duration-1000`} style={{ width: `${section.score}%` }} />
      </div>
      <p className="text-gray-400 text-xs">{section.feedback}</p>
      {section.suggestions?.length > 0 && (
        <ul className="mt-2 space-y-1">
          {section.suggestions.map((s, i) => (
            <li key={i} className="text-gray-500 text-xs flex items-start gap-1">
              <ArrowRight className="w-3 h-3 mt-0.5 text-brand-400 flex-shrink-0" /> {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState('')
  const [jobRole, setJobRole] = useState('')
  const [company, setCompany] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback(accepted => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxSize: 10 * 1024 * 1024, maxFiles: 1
  })

  const analyze = async () => {
    if (!file) { toast.error('Please upload a resume first'); return }
    setLoading(true)
    setAnalysis(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('job_description', jd)
      fd.append('job_role', jobRole)
      fd.append('company_name', company)
      const res = await resumeAPI.analyze(fd)
      setAnalysis(res.data)
      toast.success('Analysis complete! 🎯')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const radarData = analysis?.section_scores?.map(s => ({ subject: s.name, score: s.score })) || []

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="section-title">Resume Analyzer</h1>
        <p className="text-gray-400 text-sm mt-1">Please upload your resume to identify and evaluate the skills that best match your profile.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Upload */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div {...getRootProps()} className={`glass-card p-8 cursor-pointer transition-all duration-300 border-2 border-dashed ${isDragActive ? 'border-brand-500 bg-brand-500/10' : file ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-brand-500/40'}`}>
            <input {...getInputProps()} />
            <div className="text-center">
              {file ? (
                <>
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-white font-semibold">{file.name}</p>
                  <p className="text-gray-500 text-sm mt-1">{(file.size / 1024).toFixed(0)} KB • Click to replace</p>
                </>
              ) : (
                <>
                  <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragActive ? 'text-brand-400' : 'text-gray-500'}`} />
                  <p className="text-white font-semibold mb-1">{isDragActive ? 'Drop here!' : 'Drop resume or click to upload'}</p>
                  <p className="text-gray-500 text-sm">PDF or DOCX • Max 10MB</p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* JD Input */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Company Name</label>
              <input value={company} onChange={e => setCompany(e.target.value)} className="input-field" placeholder="RedHat,Google..." />
            </div>
            <div>
              <label className="label">Target Role</label>
              <input value={jobRole} onChange={e => setJobRole(e.target.value)} className="input-field" placeholder="Developer,Trainee..." />
            </div>
          </div>
          <div className="flex-1">
            <label className="label">Job Description <span className="text-gray-600">(optional)</span></label>
            <textarea value={jd} onChange={e => setJd(e.target.value)} className="input-field resize-none" rows={5}
              placeholder="Paste the job description here ...." />
          </div>
          <motion.button onClick={analyze} disabled={loading || !file} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing with AI...</>
            ) : (
              <><Zap className="w-5 h-5" /> Analyze Resume</>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Score Overview */}
            <div className="glass-card p-6">
              <h2 className="font-display text-lg font-bold text-white mb-6">📊 Analysis Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex justify-center">
                  <ATSCircle score={analysis.ats_score} />
                </div>
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="font-display text-5xl font-bold gradient-text">{analysis.match_percentage?.toFixed(0)}%</div>
                    <div className="text-gray-400 text-sm mt-1">JD Match</div>
                    <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                      {analysis.matched_skills?.slice(0, 5).map(s => (
                        <span key={s} className="badge bg-green-500/20 text-green-300 border border-green-500/30">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Strengths</p>
                    {analysis.strengths?.slice(0, 3).map((s, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-xs">{s}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Weaknesses</p>
                    {analysis.weaknesses?.slice(0, 3).map((w, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <span className="text-gray-300 text-xs">{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <p className="text-gray-300 text-sm">{analysis.overall_feedback}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Matched Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.matched_skills?.map(s => (
                    <span key={s} className="badge bg-green-500/15 text-green-300 border border-green-500/25">{s}</span>
                  ))}
                  {!analysis.matched_skills?.length && <p className="text-gray-600 text-sm">No matched skills found</p>}
                </div>
              </div>
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" /> Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_skills?.map(s => (
                    <span key={s} className="badge bg-red-500/15 text-red-300 border border-red-500/25">{s}</span>
                  ))}
                  {!analysis.missing_skills?.length && <p className="text-gray-500 text-sm">Great! No critical missing skills 🎉</p>}
                </div>
              </div>
            </div>

            {/* Section Scores + Radar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-4">Section Breakdown</h3>
                <div className="space-y-3">
                  {analysis.section_scores?.map((s, i) => <SectionScore key={i} section={s} />)}
                </div>
              </div>
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4">Skill Radar</h3>
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Radar dataKey="score" stroke="#3d5ef9" fill="#3d5ef9" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : <div className="h-64 flex items-center justify-center text-gray-600">No section data</div>}
              </div>
            </div>

            {/* Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-400" /> Improvement Suggestions
                </h3>
                <ul className="space-y-2">
                  {analysis.improvement_suggestions?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                      <ArrowRight className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" /> Better Action Verbs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.action_verb_suggestions?.map(v => (
                    <span key={v} className="badge bg-yellow-500/15 text-yellow-300 border border-yellow-500/25">{v}</span>
                  ))}
                </div>
                {analysis.ats_keywords?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-500 text-xs mb-2">ATS Keywords to Include:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.ats_keywords?.slice(0, 15).map(k => (
                        <span key={k} className="badge bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-xs">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setAnalysis(null); setFile(null) }} className="btn-secondary flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Analyze Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

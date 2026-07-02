import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  Search, Zap, CheckCircle, BookOpen, Code, Cpu,
  Users, Award, Clock, TrendingUp, AlertTriangle, ArrowRight, BarChart2
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import toast from 'react-hot-toast'
import { jdAPI } from '../services/api'

const DIFFICULTY_COLOR = { Easy: 'text-green-400', Medium: 'text-yellow-400', Hard: 'text-orange-400', 'Very Hard': 'text-red-400' }

function SkillChip({ skill, type }) {
  const colors = {
    required: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
    preferred: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    soft: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    tech: 'bg-green-500/20 text-green-300 border-green-500/30',
  }
  return <span className={`badge border ${colors[type] || colors.required}`}>{skill}</span>
}

export default function JDAnalyzer() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    setAnalysis(null)
    try {
      const res = await jdAPI.analyze(data)
      setAnalysis(res.data)
      toast.success('JD analyzed successfully! 🚀')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Analysis failed. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  const radarData = analysis ? [
    { subject: 'Technical', score: analysis.technical_skills?.length * 10 || 0 },
    { subject: 'Soft Skills', score: analysis.soft_skills?.length * 15 || 0 },
    { subject: 'Experience', score: 70 },
    { subject: 'Education', score: analysis.education_requirements?.length * 20 || 40 },
    { subject: 'Certs', score: analysis.certifications?.length * 20 || 0 },
  ].map(d => ({ ...d, score: Math.min(d.score, 100) })) : []

  const skillBarData = analysis ? [
    { name: 'Required', count: analysis.required_skills?.length || 0 },
    { name: 'Preferred', count: analysis.preferred_skills?.length || 0 },
    { name: 'Technical', count: analysis.technical_skills?.length || 0 },
    { name: 'Soft', count: analysis.soft_skills?.length || 0 },
    { name: 'ATS Keys', count: analysis.ats_keywords?.length || 0 },
  ] : []

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="section-title">Job Description Analyzer</h1>
        <p className="text-gray-400 text-sm mt-1">Decode any Job Description instantly</p>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Company Name *</label>
              <input {...register('company_name', { required: 'Required' })} className="input-field" placeholder="Google, Amazon..." />
              {errors.company_name && <p className="text-red-400 text-xs mt-1">{errors.company_name.message}</p>}
            </div>
            <div>
              <label className="label">Job Role *</label>
              <input {...register('job_role', { required: 'Required' })} className="input-field" placeholder="Software Engineer,Manger..." />
              {errors.job_role && <p className="text-red-400 text-xs mt-1">{errors.job_role.message}</p>}
            </div>
            <div>
              <label className="label">Experience Required</label>
              <input {...register('experience_required')} className="input-field" placeholder="0-? years" />
            </div>
          </div>
          <div>
            <label className="label">Job Description *</label>
            <textarea {...register('job_description', { required: 'Required', minLength: { value: 50, message: 'Please paste the full JD' } })}
              className="input-field resize-none" rows={6} placeholder="Paste the complete job description here..." />
            {errors.job_description && <p className="text-red-400 text-xs mt-1">{errors.job_description.message}</p>}
          </div>
          <div>
            <label className="label">Location</label>
            <input {...register('location')} className="input-field" placeholder="Delhi , Remote ..." />
          </div>
          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing with AI...</>
              : <><Search className="w-5 h-5" /> Analyze Job Description</>}
          </motion.button>
        </form>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header Card */}
            <div className="glass-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">{analysis.job_role}</h2>
                  <p className="text-gray-400">@ {analysis.company_name}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="text-center glass-card px-4 py-2">
                    <div className={`font-bold ${DIFFICULTY_COLOR[analysis.difficulty_level] || 'text-gray-300'}`}>{analysis.difficulty_level}</div>
                    <div className="text-gray-500 text-xs">Difficulty</div>
                  </div>
                  <div className="text-center glass-card px-4 py-2">
                    <div className="font-bold text-cyan-400">{analysis.experience_needed}</div>
                    <div className="text-gray-500 text-xs">Experience</div>
                  </div>
                  <div className="text-center glass-card px-4 py-2">
                    <div className="font-bold text-brand-400">{analysis.preparation_timeline}</div>
                    <div className="text-gray-500 text-xs">Prep Time</div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                <p className="text-gray-300 text-sm leading-relaxed">{analysis.summary}</p>
              </div>
              {analysis.salary_hints && (
                <p className="mt-3 text-green-400 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> {analysis.salary_hints}
                </p>
              )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-brand-400" /> Skill Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={skillBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="count" fill="#3d5ef9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Cpu className="w-4 h-4 text-cyan-400" /> Requirement Radar</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Radar dataKey="score" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skills Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Code className="w-4 h-4 text-brand-400" /> Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.required_skills?.map(s => <SkillChip key={s} skill={s} type="required" />)}
                </div>
                {analysis.preferred_skills?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-500 text-xs mb-2">Preferred</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.preferred_skills?.map(s => <SkillChip key={s} skill={s} type="preferred" />)}
                    </div>
                  </div>
                )}
              </div>
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-purple-400" /> Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.soft_skills?.map(s => <SkillChip key={s} skill={s} type="soft" />)}
                </div>
                {analysis.certifications?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-500 text-xs mb-2 flex items-center gap-1"><Award className="w-3 h-3" /> Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.certifications?.map(c => <SkillChip key={c} skill={c} type="tech" />)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ATS Keywords */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-3">🔑 ATS Keywords to Include in Resume</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.ats_keywords?.map(k => (
                  <span key={k} className="badge bg-yellow-500/15 text-yellow-300 border border-yellow-500/25">{k}</span>
                ))}
              </div>
            </div>

            {/* Interview Prep */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-green-400" /> Interview Topics</h3>
                <ul className="space-y-2">
                  {analysis.interview_topics?.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-green-400 font-bold text-xs mt-0.5">{String(i + 1).padStart(2, '0')}</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-3">❓ Common Interview Questions</h3>
                <ul className="space-y-2">
                  {analysis.interview_questions?.map((q, i) => (
                    <li key={i} className="text-gray-300 text-sm p-2 rounded-lg bg-white/3">{q}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Roadmap */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-400" /> Preparation Roadmap</h3>
              <div className="space-y-3">
                {analysis.learning_roadmap?.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-gray-300 text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Plan */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> Action Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.action_plan?.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white/3">
                    <ArrowRight className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {analysis.red_flags?.length > 0 && (
              <div className="glass-card p-5 border border-red-500/20">
                <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Red Flags</h3>
                <ul className="space-y-1">
                  {analysis.red_flags?.map((f, i) => <li key={i} className="text-gray-400 text-sm">⚠️ {f}</li>)}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

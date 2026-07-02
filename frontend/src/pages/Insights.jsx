import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Target, Zap, Star, AlertCircle, CheckCircle,
  BookOpen, Building, ArrowRight, RefreshCw, Sparkles
} from 'lucide-react'
import { aiAPI } from '../services/api'
import toast from 'react-hot-toast'

const InsightCard = ({ icon: Icon, title, items, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="glass-card p-5">
    <h3 className={`font-semibold text-white mb-4 flex items-center gap-2`}>
      <Icon className={`w-4 h-4 ${color}`} /> {title}
    </h3>
    {Array.isArray(items) ? (
      <ul className="space-y-2">
        {items?.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
            <ArrowRight className={`w-4 h-4 ${color} mt-0.5 flex-shrink-0`} /> {item}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-300 text-sm leading-relaxed">{items}</p>
    )}
  </motion.div>
)

export default function Insights() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await aiAPI.getInsights()
      setInsights(res.data)
    } catch (e) {
      toast.error('Could not load insights. Add more applications first.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-400">Generating Insights...</p>
        <p className="text-gray-600 text-sm mt-1">Analyzing your placement journey</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-400" />Placement Insights
          </h1>
          <p className="text-gray-400 text-sm mt-1">Personalized analysis of your placement journey</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </motion.div>

      {!insights ? (
        <div className="glass-card p-12 text-center">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No insights yet</h3>
          <p className="text-gray-500 text-sm">Add at least 3-5 applications to the tracker to get insights</p>
        </div>
      ) : (
        <>
          {/* Overall */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6 border border-brand-500/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-white mb-2">Overall Assessment</h2>
                <p className="text-gray-300 leading-relaxed">{insights.overall_assessment}</p>
                <p className="text-brand-400 text-sm mt-2 italic">"{insights.motivational_message}"</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <InsightCard icon={CheckCircle} title="Your Strengths" items={insights.strengths} color="text-green-400" delay={0.1} />
            <InsightCard icon={AlertCircle} title="Areas to Improve" items={insights.improvement_areas} color="text-orange-400" delay={0.15} />
            <InsightCard icon={Target} title="Recommendations" items={insights.recommendations} color="text-brand-400" delay={0.2} />
            <InsightCard icon={Star} title="Weekly Goals" items={insights.weekly_goals} color="text-yellow-400" delay={0.25} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InsightCard icon={BookOpen} title="Skill Gaps" items={insights.skill_gaps} color="text-red-400" delay={0.3} />
            <InsightCard icon={Building} title="Target Companies" items={insights.predicted_success_companies} color="text-cyan-400" delay={0.35} />
            <InsightCard icon={TrendingUp} title="Trend Analysis" items={insights.trend_analysis} color="text-purple-400" delay={0.4} />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5 mt-6 border border-cyan-500/20">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Success Rate Insight
            </h3>
            <p className="text-gray-300 text-sm">{insights.success_rate_insight}</p>
          </motion.div>
        </>
      )}
    </div>
  )
}

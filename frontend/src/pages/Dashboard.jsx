import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import CountUp from 'react-countup'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import {
  Briefcase, TrendingUp, Trophy, Target, ArrowRight,
  Zap, FileText, Search, MessageSquare, Calendar,
  ChevronRight, Sparkles
} from 'lucide-react'
import { placementAPI, aiAPI } from '../services/api'
import useAuthStore from '../hooks/useAuth'
import { STATUS_HEX } from '../utils/constants'

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-5 hover:border-white/20 transition-all duration-300 group"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-gray-600 text-xs">{sub}</span>
    </div>
    <div className="font-display text-3xl font-bold text-white mb-1">
      <CountUp end={typeof value === 'number' ? value : 0} duration={2} decimals={value % 1 !== 0 ? 1 : 0} />
      {typeof value === 'string' && value.includes('%') ? '%' : ''}
    </div>
    <p className="text-gray-400 text-sm">{label}</p>
  </motion.div>
)

const QuickAction = ({ icon: Icon, label, desc, path, color }) => {
  const navigate = useNavigate()
  return (
    <motion.button
      onClick={() => navigate(path)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card p-4 text-left hover:border-brand-500/30 transition-all duration-300 group w-full"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-white font-semibold text-sm mb-1">{label}</p>
      <p className="text-gray-500 text-xs">{desc}</p>
    </motion.button>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [placements, setPlacements] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const moods = [
    { emoji: "😄", text: "Happy" },
    { emoji: "😌", text: "Relaxed" },
    { emoji: "😴", text: "Tired" },
  ]

  const [selectedMood, setSelectedMood] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, placementsRes] = await Promise.all([
          placementAPI.getStats(),
          placementAPI.getAll({ limit: 5, sort_by: 'created_at', order: 'desc' })
        ])
        setStats(statsRes.data)
        setPlacements(placementsRes.data)
        // Load insights async
        aiAPI.getInsights().then(r => setInsights(r.data)).catch(() => {})
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Welcome' : hour < 17 ? 'Welcome' : 'Welcome'
  

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          {/* <span className="text-2xl">
            {hour < 12 ? '' : hour < 17 ? '' : ''}
          </span> */}
          <h1 className="font-display text-2xl font-bold text-white">
            {greeting}, <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'Champ'}</span>
          </h1>
        </div>
        {/* <p className="text-gray-400 text-sm ml-9">Here's your placement intelligence overview</p> */}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Briefcase} label="Total Applications"
          value={stats?.total_applications || 0}
          sub="All time" color="bg-brand-500/20 text-brand-400" delay={0.05}
        />
        <StatCard
          icon={Trophy} label="Offers Received"
          value={stats?.offer_count || 0}
          sub="Selected" color="bg-green-500/20 text-green-400" delay={0.1}
        />
        <StatCard
          icon={TrendingUp} label="Success Rate"
          value={stats?.success_rate || 0}
          sub="%" color="bg-cyan-500/20 text-cyan-400" delay={0.15}
        />
        <StatCard
          icon={Target} label="OA Clear Rate"
          value={stats?.oa_clear_rate || 0}
          sub="%" color="bg-purple-500/20 text-purple-400" delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-400" />
            Application Status
          </h3>
          {stats?.status_distribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.status_distribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="count" nameKey="status" paddingAngle={2}>
                  {stats.status_distribution.map((entry, i) => (
                    <Cell key={i} fill={STATUS_HEX[entry.status] || '#6b7280'} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  formatter={(value, name) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
              No data yet. Start tracking!
            </div>
          )}
        </motion.div>

        {/* Monthly Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 col-span-2">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            Monthly Applications
          </h3>
          {stats?.monthly_trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="url(#brandGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3d5ef9" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
              No monthly data yet
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Applications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Applications</h3>
            <button onClick={() => navigate('/tracker')} className="text-brand-400 text-xs flex items-center gap-1 hover:text-brand-300">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {placements.length > 0 ? placements.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/6 transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{p.company_name}</p>
                  <p className="text-gray-500 text-xs">{p.role}</p>
                </div>
                <span className={`badge ${
                  p.status === 'Selected' ? 'status-selected' :
                  p.status === 'Rejected' ? 'status-rejected' :
                  p.status?.includes('Interview') ? 'status-interview' :
                  'status-applied'
                }`}>
                  {p.status}
                </span>
              </div>
            )) : (
              <div className="py-8 text-center text-gray-600 text-sm">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No applications yet
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Insights Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Insights
            </h3>
            <button onClick={() => navigate('/insights')} className="text-brand-400 text-xs flex items-center gap-1 hover:text-brand-300">
              Full report <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {insights ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <p className="text-gray-300 text-sm">{insights.overall_assessment}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-green-300 text-xs font-semibold mb-1">💪 Strengths</p>
                <ul className="text-gray-400 text-xs space-y-0.5">
                  {insights.strengths?.slice(0, 2).map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <p className="text-orange-300 text-xs font-semibold mb-1">🎯 This week</p>
                <ul className="text-gray-400 text-xs space-y-0.5">
                  {insights.weekly_goals?.slice(0, 2).map((g, i) => <li key={i}>• {g}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-600 text-sm">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
              {loading ? 'Loading  insights...' : 'Add applications to get  insights'}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickAction icon={FileText} label="Analyze Resume" desc="Get ATS score & tips" path="/resume" color="bg-brand-500/20 text-brand-400" />
          <QuickAction icon={Search} label="Analyze JD" desc="Decode job requirements" path="/jd-analyzer" color="bg-cyan-500/20 text-cyan-400" />
          <QuickAction icon={Briefcase} label="Add Application" desc="Track new application" path="/tracker" color="bg-green-500/20 text-green-400" />
          <div className="glass-card p-4 hover:border-purple-500/30 transition-all duration-300">
            
            {!selectedMood ? (
              <>
                <p className="text-white font-semibold text-sm mb-3">
                  How are you feeling today?
                </p>

                <div className="flex gap-2 flex-wrap">
                  {moods.map((mood) => (
                    <button
                      key={mood.text}
                      onClick={() => setSelectedMood(mood)}
                      className="bg-white/5 hover:bg-purple-500/20 transition-all rounded-xl p-3 flex flex-col items-center w-[70px]"
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-[11px] text-gray-400 mt-1">
                        {mood.text}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <div className="text-5xl mb-2">
                  {selectedMood.emoji}
                </div>

                <h3 className="text-white font-semibold">
                  You're feeling {selectedMood.text}
                </h3>

                <p className="text-gray-400 text-xs mt-1">
                  Keep going 🚀
                </p>

                <button
                  onClick={() => setSelectedMood(null)}
                  className="mt-3 text-xs bg-purple-500 hover:bg-purple-600 px-3 py-1.5 rounded-lg text-white transition"
                >
                  Change Mood
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

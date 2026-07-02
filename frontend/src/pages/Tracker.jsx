import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Download, Trash2, Edit3, Save, X,
  ExternalLink, Filter, ChevronUp, ChevronDown, MoreHorizontal,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { placementAPI } from '../services/api'
import { STATUS_OPTIONS, STATUS_COLORS, STATUS_HEX, JOB_TYPES } from '../utils/constants'

const COLUMNS = [
  { key: 'company_name', label: 'Company', w: 'w-36' },
  { key: 'role', label: 'Role', w: 'w-40' },
  { key: 'status', label: 'Status', w: 'w-32' },
  { key: 'application_date', label: 'Date', w: 'w-28' },
  { key: 'salary_package', label: 'Salary', w: 'w-28' },
  { key: 'location', label: 'Location', w: 'w-28' },
  { key: 'notes', label: 'Notes', w: 'w-48' },
  { key: 'follow_up_date', label: 'Follow-Up', w: 'w-28' },
]

const emptyRow = {
  company_name: '', role: '', status: 'Applied', application_date: '',
  salary_package: '', location: '', notes: '', follow_up_date: '',
  oa_status: '', interview_r1: '', interview_r2: '', hr_round: '',
  referral_status: 'None', application_link: '', job_type: 'Full-time',
  priority: 'Medium', tags: []
}

function StatsBar({ stats }) {
  if (!stats) return null
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {[
        { label: 'Total', value: stats.total_applications, color: 'text-brand-400' },
        { label: 'Selected', value: stats.selected, color: 'text-green-400' },
        { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
        { label: 'Success Rate', value: `${stats.success_rate}%`, color: 'text-cyan-400' },
      ].map(s => (
        <div key={s.label} className="glass-card p-3 text-center">
          <div className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function AddModal({ onSave, onClose }) {
  const [form, setForm] = useState({ ...emptyRow })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!form.company_name || !form.role) {
      toast.error('Company and role are required')
      return
    }
    setLoading(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white">Add Application</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'company_name', label: 'Company Name *', type: 'text', placeholder: 'Google, Microsoft...' },
            { key: 'role', label: 'Role *', type: 'text', placeholder: 'SDE, Product Manager...' },
            { key: 'application_date', label: 'Applied Date', type: 'date' },
            { key: 'follow_up_date', label: 'Follow-Up Date', type: 'date' },
            { key: 'salary_package', label: 'Salary Package', type: 'text', placeholder: '12 LPA, $120k...' },
            { key: 'location', label: 'Location', type: 'text', placeholder: 'Bangalore, Remote...' },
            { key: 'application_link', label: 'Application Link', type: 'url', placeholder: 'https://...' },
          ].map(f => (
            <div key={f.key} className={f.key === 'notes' || f.key === 'application_link' ? 'col-span-2' : ''}>
              <label className="label">{f.label}</label>
              <input
                type={f.type || 'text'}
                value={form[f.key] || ''}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="input-field"
                placeholder={f.placeholder}
              />
            </div>
          ))}

          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="input-field">
              {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Job Type</label>
            <select value={form.job_type} onChange={e => setForm({ ...form, job_type: e.target.value })}
              className="input-field">
              {JOB_TYPES.map(t => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Priority</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              className="input-field">
              {['High', 'Medium', 'Low'].map(p => <option key={p} value={p} className="bg-gray-900">{p}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="label">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="input-field resize-none"
              rows={2}
              placeholder="Interview notes, referral details..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Application
          </button>
          <button onClick={onClose} className="btn-secondary px-6">Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Tracker() {
  const [placements, setPlacements] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  const load = useCallback(async () => {
    try {
      const [pr, sr] = await Promise.all([
        placementAPI.getAll({ search, status: filterStatus, sort_by: sortKey, order: sortDir }),
        placementAPI.getStats()
      ])
      setPlacements(pr.data)
      setStats(sr.data)
    } catch (e) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus, sortKey, sortDir])

  useEffect(() => { load() }, [load])

  const handleAdd = async (data) => {
    await placementAPI.create(data)
    toast.success('Application added!')
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return
    await placementAPI.delete(id)
    toast.success('Deleted')
    load()
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setEditForm({ ...p })
  }

  const saveEdit = async () => {
    await placementAPI.update(editingId, editForm)
    setEditingId(null)
    toast.success('Updated!')
    load()
  }

  const handleExport = async () => {
    try {
      const res = await placementAPI.exportExcel()
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'placements.xlsx'
      a.click()
      toast.success('Downloaded!')
    } catch {
      toast.error('Export failed')
    }
  }

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Placement Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">Track all your applications </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Application
          </button>
        </div>
      </div>

      <StatsBar stats={stats} />

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 py-2.5 text-sm"
            placeholder="Search company, role..."
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input-field py-2.5 text-sm w-40"
        >
          <option value="" className="bg-gray-900">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
        </select>
        <button onClick={load} className="btn-ghost p-2.5" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left p-3 text-gray-400 font-semibold w-8">#</th>
                {COLUMNS.map(col => (
                  <th key={col.key}
                    className={`text-left p-3 text-gray-400 font-semibold ${col.w} cursor-pointer hover:text-white select-none`}
                    onClick={() => toggleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key
                        ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        : null
                      }
                    </span>
                  </th>
                ))}
                <th className="p-3 text-gray-400 font-semibold w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={COLUMNS.length + 2} className="text-center py-12 text-gray-500">
                  <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
                  Loading...
                </td></tr>
              ) : placements.length === 0 ? (
                <tr><td colSpan={COLUMNS.length + 2} className="text-center py-16 text-gray-600">
                  <div className="text-4xl mb-3">📋</div>
                  <div className="font-medium">No applications found</div>
                  <div className="text-xs mt-1">Click "Add Application" to get started</div>
                </td></tr>
              ) : placements.map((p, idx) => (
                <tr key={p.id}
                  className={`border-b border-white/5 hover:bg-white/3 transition-colors ${editingId === p.id ? 'bg-brand-500/5' : ''}`}
                >
                  <td className="p-3 text-gray-600 text-xs">{idx + 1}</td>
                  {COLUMNS.map(col => (
                    <td key={col.key} className={`p-3 ${col.w}`}>
                      {editingId === p.id ? (
                        col.key === 'status' ? (
                          <select
                            value={editForm.status}
                            onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                            className="bg-gray-900 border border-white/15 text-white rounded-lg px-2 py-1 text-xs w-full"
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} className="bg-gray-900">{s}</option>)}
                          </select>
                        ) : (
                          <input
                            value={editForm[col.key] || ''}
                            onChange={e => setEditForm({ ...editForm, [col.key]: e.target.value })}
                            className="bg-gray-900 border border-brand-500/40 text-white rounded-lg px-2 py-1 text-xs w-full"
                          />
                        )
                      ) : (
                        col.key === 'status' ? (
                          <span className={`badge text-xs ${STATUS_COLORS[p.status] || 'status-waiting'}`}>
                            {p.status}
                          </span>
                        ) : col.key === 'company_name' ? (
                          <span className="text-white font-medium">{p[col.key]}</span>
                        ) : (
                          <span className="text-gray-400 truncate block max-w-[160px]">{p[col.key] || '—'}</span>
                        )
                      )}
                    </td>
                  ))}
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      {editingId === p.id ? (
                        <>
                          <button onClick={saveEdit} className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors" title="Save">
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-white/5 transition-colors" title="Cancel">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          {p.application_link && (
                            <a href={p.application_link} target="_blank" rel="noopener" className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-gray-600 text-xs mt-2 text-right">{placements.length} applications shown</p>

      <AnimatePresence>
        {showAddModal && <AddModal onSave={handleAdd} onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
